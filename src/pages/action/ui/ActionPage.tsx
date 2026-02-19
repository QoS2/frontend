import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@shared/ui';

// Widgets
import { QuizWidget } from '@widgets/mission-quiz';
import { CameraMissionWidget } from '@widgets/mission-camera';
import { SpotDetailWidget } from '@widgets/spot-detail';
import { QuestBoard } from '@widgets/quest-board';

// Models
import { useMissionStep, useSubmitMission } from '@entities/mission/model';
import { useGuideContent } from '@entities/guide/model';
import { useSpotDetail, useSpotGuide } from '@entities/spot/model';

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
  contentId, 
  targetName,
  questId,
  runId,
  onComplete,
}: ActionPageProps) {
    // Note: 'viewState' is removed as ActionPage now focuses only on MISSION execution
    
    // --- Data Fetching ---
    
    // 1. Mission Type (QUIZ, CAMERA, REWARD)
    const stepId = (type === 'QUIZ' || type === 'CAMERA' || type === 'REWARD') ? contentId : undefined;
    const { data: mission, isLoading: isMissionLoading } = useMissionStep(stepId);

    // 2. Legacy QUEST Type
    const isQuestType = type === 'QUEST';
    const { data: content, isLoading: isContentLoading } = useGuideContent(isQuestType ? contentId : null);

    // 3. Spot Detail Type
    const isSpotDetailType = type === 'SPOT_DETAIL';
    const { data: spotDetail, isLoading: isSpotLoading } = useSpotDetail(isSpotDetailType ? contentId : null);
    const { data: spotGuides } = useSpotGuide(isSpotDetailType ? contentId : null);

    // Submission Mutation
    const submitMutation = useSubmitMission();

    // --- Handlers ---
    const handleQuizAnswer = (answer: string) => {
        submitMutation.mutate({
            runId: runId || 0,
            stepId: contentId,
            data: { type: 'QUIZ', answer }
        }, {
            onSuccess: (data) => {
                if (data.success) onComplete();
                else alert(data.message);
            }
        });
    };

    const handlePhotoCapture = (photoUrl: string) => {
        submitMutation.mutate({
            runId: runId || 0, 
            stepId: contentId,
            data: { type: 'PHOTO', photoUrl }
        }, {
             onSuccess: (data) => {
                if (data.success) onComplete();
            }
        });
    };

    // --- Render Logic ---
    const isLoading = isContentLoading || isMissionLoading || isSpotLoading;
    if (isLoading) {
         return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // A. Spot Detail View
    if (type === 'SPOT_DETAIL' && spotDetail) {
        return (
            <SpotDetailWidget 
                spot={spotDetail}
                guides={spotGuides || []}
                onClose={onComplete}
            />
        );
    }

    // B. Legacy QUEST View
    if (type === 'QUEST' && content) {
        // ... (existing Quest logic)
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

    // C. Mission View (QUIZ)
    if (type === 'QUIZ') {
         if (!mission) return <View><Text>Mission Not Found</Text></View>;
         
         return (
            <QuizWidget 
                mission={mission} 
                onAnswer={handleQuizAnswer} 
                isSubmitting={submitMutation.isPending} 
            />
        );
    }

    // D. Mission View (CAMERA)
    if (type === 'CAMERA') {
         if (!mission) return <View><Text>Mission Not Found</Text></View>;

         return (
            <CameraMissionWidget 
                mission={mission} 
                onCapture={handlePhotoCapture} 
                onClose={onComplete}
                onComplete={onComplete}
                runId={runId || 0}
                stepId={contentId}
            />
        );
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
