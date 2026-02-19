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
    // A. If type is MISSION (QUIZ/PHOTO/REWARD)
    // We assume contentId IS the stepId or related ID
    const stepId = (type === 'QUIZ' || type === 'CAMERA' || type === 'REWARD') ? contentId : undefined;
    
    // B. Legacy QUEST type
    const isQuestType = type === 'QUEST';
    const { data: content, isLoading: isContentLoading } = useGuideContent(isQuestType ? contentId : null);

    // C. Mission Fetching (if needed)
    // For now, we mock mission fetch or use stepId directly if logic requires
    // In real implementation, we might fetch specific mission details here
    const { data: mission, isLoading: isMissionLoading } = useMissionStep(stepId);

    // Submission Mutation
    const submitMutation = useSubmitMission();

    // --- Handlers ---
    const handleQuizAnswer = (answer: string) => {
        // ... (Logic remains same)
        // Note: For now assuming mission object exists or we construct data
        submitMutation.mutate({
            runId: runId || 0,
            stepId: contentId, // Using contentId as stepId
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
    if (isContentLoading) {
         return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    // A. Legacy QUEST View
    if (type === 'QUEST' && content) {
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

    // B. Mission View (Directly render Widget based on type)
    if (type === 'QUIZ') {
         // Mock mission object for QuizWidget if data not fetched
         const mockMission = { 
             id: contentId, 
             stepId: contentId, 
             type: 'QUIZ', 
             title: targetName || 'Quiz', 
             description: 'Solve this!', 
             status: 'IN_PROGRESS',
             quiz: { question: 'Is this real?', options: [{id:'1', text:'Yes'}, {id:'2', text:'No'}] }
         };
         
         return (
            <QuizWidget 
                mission={mission || mockMission as any} 
                onAnswer={handleQuizAnswer} 
                isSubmitting={submitMutation.isPending} 
            />
        );
    }

    if (type === 'CAMERA') {
         const mockMission = {
             id: contentId,
             stepId: contentId,
             type: 'PHOTO',
             title: targetName || 'Photo Mission',
             description: 'Take a photo here!',
             status: 'IN_PROGRESS',
             photo: { targetUrl: '' }
         };

         return (
            <CameraMissionWidget 
                mission={mission || mockMission as any} 
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
