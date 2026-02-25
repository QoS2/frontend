import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStore, ChatAction } from '@features/ai-chat';
import { useRunProgressStore } from '@features/run-progress';
import { useNextTurnByUrl } from '@entities/run/model';

interface UseTurnPlayerProps {
    isHistoryLoading: boolean;
    mapActionToChatActions: (action: any) => ChatAction[];
}

export function useTurnPlayer({ isHistoryLoading, mapActionToChatActions }: UseTurnPlayerProps) {
    const { isStreaming, addMessage, streamReply } = useChatStore();
    const { activeSessionId, currentTurn, setCurrentTurn, playedTurnIds, markTurnAsPlayed } = useRunProgressStore();
    const { mutate: fetchNextTurn } = useNextTurnByUrl();

    const previousStreamingTurnRef = useRef(isStreaming);
    const [isTurnFetching, setIsTurnFetching] = useState(false);

    // ref로 동기화 (Effect 의존성에서 제외하여 불필요한 재생성 방지)
    const playedTurnIdsRef = useRef<number[]>([]);
    useEffect(() => {
        playedTurnIdsRef.current = playedTurnIds;
    }, [playedTurnIds]);

    const processTurnAction = useCallback((action: any, delayMs?: number | null) => {
        if (!action) return;
        
        if (action.type === 'AUTO_NEXT' && action.nextApi) {
            setIsTurnFetching(true);
            setTimeout(() => {
                fetchNextTurn(action.nextApi, {
                    onSuccess: (nextTurn) => {
                        setCurrentTurn(nextTurn);
                        setIsTurnFetching(false);
                    },
                    onError: (e) => {
                        console.error("fetchNextTurn Error", e);
                        setIsTurnFetching(false);
                    }
                });
            }, delayMs || 0);
        } else {
            const chatActions = mapActionToChatActions(action);
            if (chatActions.length > 0) {
                // Rule applied: rerender-defer-reads (use getState inside callback)
                useChatStore.getState().addMessage({
                    sender: 'ai',
                    type: 'action',
                    actions: chatActions,
                });
            }
        }
    }, [fetchNextTurn, mapActionToChatActions, setCurrentTurn]);

    // Play currentTurn
    useEffect(() => {
        if (!activeSessionId || !currentTurn) return;
        if (isHistoryLoading) return;
        if (playedTurnIdsRef.current.includes(currentTurn.turnId)) return;
        if (isStreaming || isTurnFetching) return;
    
        markTurnAsPlayed(currentTurn.turnId);

        if (currentTurn.assets && currentTurn.assets.length > 0) {
            currentTurn.assets.forEach((asset: any) => {
                if (asset.type === 'IMAGE') {
                    addMessage({ sender: 'ai', type: 'image', imageUrl: asset.url });
                }
            });
        }

        if (currentTurn.text) {
            streamReply(currentTurn.text);
        } else {
            processTurnAction(currentTurn.action, currentTurn.delayMs);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSessionId, currentTurn?.turnId, isStreaming, isTurnFetching, isHistoryLoading]); // Primitive deps

    // When text streaming ends, process action
    useEffect(() => {
        if (!activeSessionId || !currentTurn) return;
        
        if (previousStreamingTurnRef.current && !isStreaming && currentTurn && currentTurn.text) {
            processTurnAction(currentTurn.action, currentTurn.delayMs);
        }
        previousStreamingTurnRef.current = isStreaming;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isStreaming, activeSessionId, currentTurn?.turnId]); // Primitive deps

    return {
        isTurnFetching,
        processTurnAction
    };
}
