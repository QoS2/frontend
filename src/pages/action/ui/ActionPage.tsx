import React, { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@shared/ui';

// Widgets
import { QuestPlay } from '@features/quest-play';
import { CameraMissionWidget } from '@widgets/mission-camera';
import { SpotDetailWidget } from '@widgets/spot-detail';
import { QuestBoard } from '@widgets/quest-board';

// Models
import { useMissionStep, useSubmitMission } from '@entities/mission/model';
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
    // Note: contentId passed here is the mission's stepId (equivalent to spotId for spot guides)
    const stepId = (type === 'QUIZ' || type === 'CAMERA' || type === 'REWARD') ? contentId : undefined;
    const { data: mission, isLoading: isMissionLoading } = useMissionStep(stepId);
    const isCompleted = mission?.status === 'COMPLETED';

    console.log('[CHAT_DEBUG] ActionPage - stepId:', stepId, 'missionStatus:', mission?.status, 'isCompleted:', isCompleted);

    // 2. Legacy QUEST Type (Placeholder preserved for logic)
    const content = null;
    const isContentLoading = false;

    // 3. Spot Detail Type
    const isSpotDetailType = type === 'SPOT_DETAIL';
    const { data: spotDetail, isLoading: isSpotLoading } = useSpotDetail(isSpotDetailType ? contentId : null);
    const { data: spotGuides } = useSpotGuide(isSpotDetailType ? contentId : null);

    // 4. Mission Type Detection
    // If the API says it's a PHOTO mission, even if 'QUIZ' was passed, we should show CAMERA.
    const activeType = mission?.missionType === 'PHOTO' ? 'CAMERA' : (mission?.missionType === 'QUIZ' || mission?.missionType === 'OX') ? 'QUIZ' : type;

    console.log('[CHAT_DEBUG] ActionPage - activeType:', activeType, 'missionType:', mission?.missionType);

    // Submission Mutation
    const submitMutation = useSubmitMission();

    // --- Handlers ---
    const handleCheckAnswer = (answerText: string, callback: (isCorrect: boolean, feedback: string) => void) => {
        if (isCompleted) return; // Prevent resubmit
        const choice = mission?.optionsJson?.choices?.find(c => c.text === answerText);
        const optionId = choice?.id || answerText;
        submitMutation.mutate({
            runId: runId || 0,
            stepId: contentId,
            data: { missionType: mission?.missionType || 'QUIZ', selectedOptionId: optionId }
        }, {
            onSuccess: (data) => callback(data.isCorrect, data.feedback)
        });
    };

    const handlePhotoCapture = (photoUrl: string) => {
        submitMutation.mutate({
            runId: runId || 0, 
            stepId: contentId,
            data: { missionType: 'PHOTO', photoUrl }
        }, {
             onSuccess: (data) => {
                if (data.isCorrect) onComplete();
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
                guides={spotGuides?.segments || []}
                onClose={onComplete}
            />
        );
    }

    // B. Legacy QUEST View
    if (type === 'QUEST' && content) {
        // ... (existing Quest logic)
        const activeQuests = questId 
          ? (content as any).quests?.filter((q: any) => q.id === questId) 
          : (content as any).quests;

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
    if (activeType === 'QUIZ') {
         if (!mission) return <View><Text>Mission Not Found</Text></View>;
         
         const questData = {
             id: mission.missionId.toString(),
             type: 'MULTIPLE_CHOICE' as const,
             question: mission.prompt,
             options: mission.optionsJson?.choices?.map(c => c.text) || [],
             answer: '', // Async validation handles this
             hintText: mission.optionsJson?.hintText,
         };

         return (
            <QuestPlay 
                quest={questData} 
                onCheckAnswer={handleCheckAnswer}
                onComplete={onComplete}
                onClose={onComplete}
                locationName={targetName || 'Mission'}
                progressText="1/1"
                isCompleted={isCompleted}
            />
        );
    }

    // D. Mission View (CAMERA)
    if (activeType === 'CAMERA') {
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
