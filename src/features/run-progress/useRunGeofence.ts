import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { getDistance } from '@shared/lib/geo';
import { useRunProgressStore } from './runProgressStore';
import { useProximityCheck } from '@entities/run/model';

const DWELL_TIME_MS = 3000;

export function useRunGeofence(
  location: { latitude: number; longitude: number } | null,
  runId: number | null
) {
  const { currentTarget, isAtTarget, setIsAtTarget, setSession } = useRunProgressStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { mutate: checkProximity } = useProximityCheck();

  useEffect(() => {
    // 위치 정보나 타겟이 없으면 감지 불가
    if (!location || !currentTarget) {
      if (isAtTarget) {
        setIsAtTarget(false);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const distance = getDistance(
      location.latitude,
      location.longitude,
      currentTarget.lat,
      currentTarget.lng
    );

    const isInsideRadius = distance <= currentTarget.radiusM;

    if (isInsideRadius && !isAtTarget) {
      // 반경 내 진입: 타이머 시작
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          if (runId) {
            checkProximity(
              {
                runId,
                data: { lat: location.latitude, lng: location.longitude },
              },
              {
                onSuccess: (res) => {
                  if (res && res.event === 'PROXIMITY') {
                    setSession(res.sessionId, res.message ?? null);
                    setIsAtTarget(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                },
                onError: (err) => {
                  console.error('Proximity Check Failed:', err);
                  setIsAtTarget(true);
                }
              }
            );
          } else {
             setIsAtTarget(true);
             Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          timerRef.current = null;
        }, DWELL_TIME_MS);
      }
    } else if (!isInsideRadius) {
      // 반경 이탈: 즉시 상태 초기화
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (isAtTarget) {
        setIsAtTarget(false);
      }
    }
  }, [location, currentTarget, isAtTarget, setIsAtTarget]);
}
