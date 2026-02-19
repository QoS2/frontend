import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@shared/ui';

// Widgets
import { QuizWidget } from '@widgets/mission-quiz';
import { CameraMissionWidget } from '@widgets/mission-camera';
import { SpotDetailWidget } from '@widgets/spot-detail';
import { QuestBoard } from '@widgets/quest-board';

// Models
import { useSpotDetail, useSpotGuide } from '@entities/spot/model';
import { useMissionStep, useSubmitMission } from '@entities/mission/model';
import { useGuideContent } from '@entities/guide/model';

interface ActionPageProps {
  type: string;
  contentId: string;
  questId?: string;
  targetName?: string;
  rewardId?: string;
  runId?: number;
  onComplete: () => void;
}

export function ActionPage({
  type,
  contentId, // ID used for fetching data (e.g., spotId or stepId)
  targetName,
  questId,
  runId,
  onComplete,
}: ActionPageProps) {
    // State to track internal flow (e.g. Spot Detail -> Mission)
    const [viewState, setViewState] = useState<'DETAIL' | 'MISSION'>('DETAIL');
    
    // --- Data Fetching ---
    // 1. If type is SPOT_DETAIL, we fetch Spot Data
    const spotId = (type === 'SPOT_DETAIL' || type === 'PHOTO' || type === 'TREASURE') ? contentId : null;
    const { data: spot, isLoading: isSpotLoading } = useSpotDetail(spotId || 0);
    const { data: guides } = useSpotGuide(spotId || 0);

    // 2. If type is MISSION (QUIZ), we fetch Mission Step
    const stepId = (type === 'QUIZ' || (viewState === 'MISSION' && spotId)) ? `step_${contentId}` : undefined;
    const { data: mission, isLoading: isMissionLoading } = useMissionStep(stepId);

    // 3. If type is QUEST (Legacy), use GuideContent
    const isQuestType = type === 'QUEST';
    const { data: content, isLoading: isContentLoading } = useGuideContent(isQuestType ? contentId : null);

    // 3. Submission Mutation
    const submitMutation = useSubmitMission();

    // --- Handlers ---
    const handleStartMission = () => {
        setViewState('MISSION');
    };

    const handleQuizAnswer = (answer: string) => {
        if (!mission) return;
        submitMutation.mutate({
            runId: runId || 0, // Use passed runId
            stepId: mission.stepId,
            data: { type: 'QUIZ', answer }
        }, {
            onSuccess: (data) => {
                if (data.success) {
                    onComplete(); // Or show reward first
                } else {
                    alert(data.message); // Simple alert for MVP
                }
            }
        });
    };

    const handlePhotoCapture = (photoUrl: string) => {
        if (!mission) return;
        submitMutation.mutate({
            runId: runId || 0, 
            stepId: mission.stepId,
            data: { type: 'PHOTO', photoUrl }
        }, {
             onSuccess: (data) => {
                if (data.success) {
                    onComplete();
                }
            }
        });
    };


    // --- Render Logic ---
    
    // Loading State
    if (isSpotLoading || (viewState === 'MISSION' && isMissionLoading) || isContentLoading) {
         return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-4 text-gray-500">Loading...</Text>
            </View>
        );
    }

    // A. Legacy QUEST View
    if (type === 'QUEST' && content) {
        // Filter quests if questId is provided
        const activeQuests = questId 
          ? content.quests?.filter(q => q.id === questId) 
          : content.quests;

        if (!activeQuests || activeQuests.length === 0) {
             return (
                <View className="flex-1 justify-center items-center">
                    <Text>Quest not found</Text>
                    <Pressable onPress={onComplete} className="mt-4 p-2 bg-gray-200 rounded">
                        <Text>Go Back</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <QuestBoard 
                quests={activeQuests} 
                onClose={onComplete}
            />
        );
    }

    // B. Spot Detail View
    if (viewState === 'DETAIL' && spot) {
        // If it's just a simple photo spot without mission, maybe just show detail?
        // Or if type is TREASURE, show detail then claim?
        return (
            <SpotDetailWidget 
                spot={spot} 
                guides={guides || []} 
                onStartMission={handleStartMission} 
                onClose={onComplete}
            />
        );
    }

    // B. Mission View
    if (viewState === 'MISSION' && mission) {
        if (mission.type === 'QUIZ') {
            return (
                <QuizWidget 
                    mission={mission} 
                    onAnswer={handleQuizAnswer} 
                    isSubmitting={submitMutation.isPending} 
                />
            );
        }
        if (mission.type === 'PHOTO') {
            return (
                <CameraMissionWidget 
                    mission={mission} 
                    onCapture={handlePhotoCapture} 
                    onClose={onComplete}
                    onComplete={onComplete}
                    runId={runId || 1}
                    stepId={mission.id}
                />
            );
        }
    }

    // Fallback / Error
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <Text className="text-red-500 mb-4">Content not found</Text>
            <Pressable onPress={onComplete} className="p-3 bg-gray-200 rounded-lg">
                <Text>Go Back</Text>
            </Pressable>
        </View>
    );
}
