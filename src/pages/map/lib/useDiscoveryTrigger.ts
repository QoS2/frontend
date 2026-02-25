import { useEffect, useRef } from 'react';
import { useChatStore } from '@features/ai-chat';
import { useMapNavigationStore } from '@features/map-navigation';
import { useDiscoveryPopupStore } from '@features/discovery-popup';

interface UseDiscoveryTriggerProps {
    isRunMode: boolean;
    isAtTarget: boolean;
    targetMarkerId?: string;
    markers: any[];
    currentRun: any;
}

export function useDiscoveryTrigger({ 
    isRunMode, 
    isAtTarget, 
    targetMarkerId, 
    markers,
    currentRun 
}: UseDiscoveryTriggerProps) {
    const { setTriggeredMarkerId, triggeredMarkerId } = useMapNavigationStore();
    const { showPopup, dismissedMarkerId } = useDiscoveryPopupStore();
    
    // 1. Inject guide welcome message when entering run mode
    const hasInjectedRef = useRef(false);
    
    useEffect(() => {
        // Use getState() instead of subscribing to addMessage to avoid recreating effect
        const { addMessage } = useChatStore.getState();

        if (isRunMode && !hasInjectedRef.current) {
            const completedIds = currentRun?.progress?.completedSpotIds || [];
            if (completedIds.length === 0) {
                addMessage({
                    sender: 'ai',
                    type: 'text',
                    text: '🎉 투어를 시작합니다! 첫 번째 목적지인 광화문으로 이동해주세요.',
                });
            }
            hasInjectedRef.current = true;
        }
        if (!isRunMode) {
            hasInjectedRef.current = false;
        }
    }, [isRunMode, currentRun?.progress?.completedSpotIds?.length]); // Dep on primitives where possible

    // 2. Auto-trigger GuideChat when entering Target Geofence
    useEffect(() => {
        if (isRunMode && isAtTarget && targetMarkerId) {
            setTriggeredMarkerId(targetMarkerId);
        }
    }, [isRunMode, isAtTarget, targetMarkerId, setTriggeredMarkerId]);

    // 3. Popup for Photo/Treasure markers
    useEffect(() => {
        if (!triggeredMarkerId) return;

        const marker = markers.find(m => m.id === triggeredMarkerId);
        if (!marker) return;

        // Check if user already dismissed this marker popup in this session
        if (dismissedMarkerId === marker.id) return;

        if (marker.type === 'PHOTO' || marker.type === 'TREASURE') {
            showPopup({
                type: marker.type as 'PHOTO' | 'TREASURE',
                markerId: marker.id,
                markerTitle: marker.title,
            });
        }
    }, [triggeredMarkerId, markers, dismissedMarkerId, showPopup]);
}
