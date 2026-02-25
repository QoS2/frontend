import { useState, useEffect, useRef, useMemo } from 'react';
import { useChatStore, ChatMessage, ChatAction } from '@features/ai-chat';
import { fetchChatSession, fetchChatHistory } from '@entities/run/model';
import { useRunProgressStore } from '@features/run-progress';
import { useMapNavigationStore } from '@features/map-navigation';

interface UseChatHistoryProps {
    runId?: number | null;
    tourDetail: any;
    markers: any[] | undefined;
    routeStepId?: string;
    routeTitle?: string;
    processTurnAction: (action: any, delayMs?: number | null) => void;
}

export function useChatHistory({ 
    runId, 
    tourDetail, 
    markers, 
    routeStepId, 
    routeTitle,
    processTurnAction 
}: UseChatHistoryProps) {
    const { triggeredMarkerId, activeMarkerId } = useMapNavigationStore();
    const { setActiveSpot, setMessages, addMessage } = useChatStore();
    const { setSession, markTurnAsPlayed, activeSessionId, currentTarget } = useRunProgressStore();

    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // 1. Determine Context
    const contextStepIdRaw = routeStepId || triggeredMarkerId || activeMarkerId;
    
    // Note: Only PLACE and SUB_PLACE markers have chat sessions.
    // Maintain the last valid context so chat doesn't disrupt when passing by a PHOTO spot.
    const lastValidContextRef = useRef<string | null>(null);
    const contextStepId = useMemo(() => {
        if (!contextStepIdRaw || !markers) return lastValidContextRef.current;
        const marker = markers.find((m) => m.id.toString() === contextStepIdRaw.toString());
        if (marker && (marker.type === 'PLACE' || marker.type === 'SUB_PLACE')) {
            lastValidContextRef.current = contextStepIdRaw.toString();
            return contextStepIdRaw.toString();
        }
        return lastValidContextRef.current;
    }, [contextStepIdRaw, markers]);

    const activeMarker = markers?.find((m) => m.id.toString() === contextStepId?.toString());
    const displayTitle = routeTitle || activeMarker?.title || 'AI Tour Guide';

    // 2. Action Utilities
    const mapActionToChatActions = (action: any): ChatAction[] => {
        if (!action) return [];
        const chatActions: ChatAction[] = [];
        
        let missionStepId = action.stepId;
        if (!missionStepId && contextStepId) {
            const spotMatched = tourDetail?.mainMissionPath?.find(
                (path: any) => path.spotId.toString() === contextStepId.toString()
            );
            if (spotMatched && spotMatched.missions && spotMatched.missions.length > 0) {
                missionStepId = spotMatched.missions[0].stepId;
            }
        }

        const completedSpotIds = tourDetail?.currentRun?.progress?.completedSpotIds || [];
        const isCompleted = contextStepId ? completedSpotIds.includes(Number(contextStepId)) : false;

        if (action.type === 'MISSION_CHOICE') {
            if (!missionStepId) {
                console.warn('[CHAT_DEBUG] MISSION_CHOICE with no valid stepId or contextStepId');
                return [];
            }
            chatActions.push({ 
                label: isCompleted ? '완료된 미션 보기' : '시작하기', 
                actionId: 'start-mission', 
                data: { stepId: missionStepId, isCompleted } 
            });
        } else if (action.type === 'NEXT') {
            if (action.nextApi) {
                chatActions.push({ 
                    label: '다음으로', 
                    actionId: 'next-turn', 
                    data: { nextApi: action.nextApi } 
                });
            } else {
                chatActions.push({ 
                    label: '다음 장소로', 
                    actionId: 'go-guide-list', 
                    data: {} 
                });
            }
        }
        return chatActions;
    };

    // 3. Effect: spot → session → history → display (Uses primitive dependencies where possible)
    useEffect(() => {
        if (!contextStepId || !runId) return;

        let cancelled = false;
        const spotIdNum = Number(contextStepId);
        if (isNaN(spotIdNum)) return;

        // 가드: 스팟 언락 여부 확인
        const completedIds = tourDetail?.currentRun?.progress?.completedSpotIds || [];
        const isCompleted = completedIds.includes(spotIdNum);
        const isCurrentWithSession = currentTarget?.spotId === spotIdNum && !!activeSessionId;

        if (!isCompleted && !isCurrentWithSession) {
            setActiveSpot(contextStepId.toString());
            const markerTitle = activeMarker?.title || '다음 장소';
            setMessages([{
                id: 'nav-guide', 
                sender: 'ai', 
                type: 'text',
                text: `📍 ${markerTitle}(으)로 이동해주세요!\n도착하면 AI 가이드가 시작됩니다.`,
                timestamp: Date.now(),
            }]);
            setIsHistoryLoading(false);
            return;
        }

        // Clear old messages for this new spot
        // getState() for setActiveSpot isn't needed here because we got it from hook,
        // but we're moving it inside the hook anyway.
        setActiveSpot(contextStepId.toString());
        setIsHistoryLoading(true);

        (async () => {
            try {
                const session = await fetchChatSession({ runId, spotId: spotIdNum });
                if (cancelled) return;

                setSession(session.sessionId, null);

                const history = await fetchChatHistory(session.sessionId);
                if (cancelled) return;

                const historicalMessages: ChatMessage[] = [];
                history.turns.forEach((turn: any) => {
                    markTurnAsPlayed(turn.turnId);

                    if (turn.assets) {
                        turn.assets.forEach((asset: any) => {
                            if (asset.type === 'IMAGE') {
                                historicalMessages.push({
                                    id: `hist-asset-${asset.id}`,
                                    sender: 'ai',
                                    type: 'image',
                                    imageUrl: asset.url,
                                    timestamp: Date.now() - 1000,
                                });
                            }
                        });
                    }

                    if (turn.text) {
                        historicalMessages.push({
                            id: `hist-${turn.turnId}`,
                            sender: turn.role === 'USER' ? 'user' : 'ai',
                            type: 'text',
                            text: turn.text,
                            timestamp: Date.now() - 500,
                        });
                    }

                    const chatActions = mapActionToChatActions(turn.action);
                    if (chatActions.length > 0) {
                        historicalMessages.push({
                            id: `hist-action-${turn.turnId}`,
                            sender: 'ai',
                            type: 'action',
                            actions: chatActions,
                            timestamp: Date.now() - 500,
                        });
                    }
                });

                if (!cancelled) {
                    // 첫 입장 (히스토리 없음)
                    if (history.turns.length === 0 && history.hasNextScript && history.nextScriptApi) {
                        setMessages([]); // Start empty
                        processTurnAction({ type: 'AUTO_NEXT', nextApi: history.nextScriptApi }, 0);
                        return;
                    }

                    // 재방문 (히스토리 있음)
                    setMessages(historicalMessages);

                    const lastTurn = history.turns[history.turns.length - 1];
                    if (lastTurn && lastTurn.action?.type === 'AUTO_NEXT' && contextStepId === (triggeredMarkerId || activeMarkerId)) {
                        processTurnAction(lastTurn.action, lastTurn.delayMs);
                    }
                }
            } catch (error: any) {
                if (error?.status === 400 || error?.response?.status === 400) {
                    const markerTitle = activeMarker?.title || '다음 장소';
                    if (!cancelled) {
                        setMessages([{
                            id: 'nav-guide', 
                            sender: 'ai', 
                            type: 'text',
                            text: `📍 ${markerTitle}(으)로 이동해주세요!\n도착하면 AI 가이드가 시작됩니다.`,
                            timestamp: Date.now(),
                        }]);
                    }
                } else {
                    console.error('[Chat] Failed to load history:', error);
                }
            } finally {
                if (!cancelled) setIsHistoryLoading(false);
            }
        })();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextStepId, runId, activeSessionId]); // Added activeSessionId dependency


    return {
        contextStepId,
        activeMarker,
        displayTitle,
        isHistoryLoading,
        mapActionToChatActions
    };
}
