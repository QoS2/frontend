import { useCallback } from 'react';
import { useMapNavigationStore } from '@features/map-navigation';
import { useActionOverlayStore } from '@features/action-overlay/useActionOverlayStore';
import { useCurrentRun } from '@entities/tour/model';

interface UseChatActionHandlerProps {
    contextStepId?: string | null;
    activeMarker?: any;
    runId?: number | null;
}

export function useChatActionHandler({ contextStepId, activeMarker, runId }: UseChatActionHandlerProps) {
    const { setTriggeredMarkerId } = useMapNavigationStore();
    const { openAction } = useActionOverlayStore();
    const { currentRun } = useCurrentRun();

    const handleActionClick = useCallback((action: any) => {
        if (!contextStepId || !activeMarker) return;

        switch (action.actionId) {
            case 'start-mission':
                // Set the current spot as the triggered spot to keep the bottom sheet on this spot
                setTriggeredMarkerId(contextStepId);
                
                openAction({
                    type: action.data.isCompleted ? 'MISSION_CHOICE' : activeMarker.type,
                    contentId: contextStepId,
                    questId: action.data.stepId.toString(),
                    targetName: activeMarker.title,
                });
                break;
                
            case 'next-step':
                // Set to null to indicate we're going to the next spot
                setTriggeredMarkerId(null);
                
                openAction({
                    type: 'NEXT_PLACE',
                    contentId: contextStepId,
                    questId: '0',
                    targetName: '다음 장소 힌트',
                });
                break;
                
            default:
                console.warn('Unhandled chat action:', action);
        }
    }, [contextStepId, activeMarker, setTriggeredMarkerId, openAction]);

    const isMissionCompleted = useCallback(() => {
        if (!contextStepId || !currentRun) return false;
        const completedSpotIds = currentRun.progress.completedSpotIds || [];
        return completedSpotIds.includes(Number(contextStepId));
    }, [contextStepId, currentRun?.progress?.completedSpotIds?.length]); // primitive dependency

    return {
        handleActionClick,
        isMissionCompleted
    };
}
