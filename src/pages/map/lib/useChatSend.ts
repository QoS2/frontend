import { useState } from 'react';
import { Keyboard } from 'react-native';
import { useChatStore } from '@features/ai-chat';
import { useSendMessage } from '@entities/run/model';
import { useRunProgressStore } from '@features/run-progress';

interface UseChatSendProps {
    activeSessionId?: number | null;
}

export function useChatSend({ activeSessionId }: UseChatSendProps) {
    const [inputText, setInputText] = useState('');
    const { mutate: sendMessage } = useSendMessage();
    const { setCurrentTurn } = useRunProgressStore();

    // Use getState to avoid rerendering component when isStreaming changes if not necessary
    // However, since we need to disable the UI button, we still need to subscribe to isStreaming
    // in the component. But we can use getState() inside the callback for addMessage/streamReply.
    const handleSend = (isStreaming: boolean) => {
        if (!inputText.trim() || isStreaming) return;
        Keyboard.dismiss();

        const textToSend = inputText.trim();
        const { addMessage, streamReply } = useChatStore.getState();

        addMessage({ sender: 'user', text: textToSend, type: 'text' });
        setInputText('');

        if (activeSessionId) {
            sendMessage(
                { sessionId: activeSessionId, data: { text: textToSend } },
                {
                    onSuccess: (res) => {
                        // Map ChatMessageResponse to ChatTurn
                        const aiTurn = {
                            turnId: res.aiTurnId,
                            role: 'GUIDE',
                            source: 'LLM',
                            text: res.aiText,
                            action: res.hasNextScript ? { type: 'AUTO_NEXT', nextApi: res.nextScriptApi } : null,
                        };
                        setCurrentTurn(aiTurn as any);
                    },
                    onError: (err) => {
                        console.error('Chat Send Failed:', err);
                    }
                }
            );
        } else {
            // Fallback for non-run mode or missing session
            setTimeout(() => {
                streamReply('📍 해당 위치에 도착한 후 질문을 시작할 수 있습니다!');
            }, 500);
        }
    };

    return {
        inputText,
        setInputText,
        handleSend
    };
}
