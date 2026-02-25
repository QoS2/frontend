import React, { memo } from 'react';
import { View, Pressable, Image } from 'react-native';
import { Text, TypewriterText } from '@shared/ui';
import { ChatAvatar } from '@shared/assets/icons';
import { ChatMessage, ChatAction, useChatStore } from '@features/ai-chat';

interface ChatMessageBubbleProps {
    msg: ChatMessage;
    onAction: (action: ChatAction) => void;
    onImageSelect: (url: string) => void;
}

// Rule applied: rerender-memo (Exported as memoized component)
export const ChatMessageBubble = memo(function ChatMessageBubble({ 
    msg, 
    onAction, 
    onImageSelect 
}: ChatMessageBubbleProps) {
    
    const handleStreamingComplete = () => {
        // Rule applied: rerender-defer-reads (use getState inside callback)
        useChatStore.getState().finishStreaming(msg.id);
    };

    const renderMessageContent = () => {
      switch (msg.type) {
        case 'image':
          return (
            <Pressable
              onPress={() => msg.imageUrl && onImageSelect(msg.imageUrl)}
              className="rounded-2xl overflow-hidden border border-gray-200 mt-1"
              style={{ width: 220, height: 160 }}
            >
              <Image
                source={{ uri: msg.imageUrl }}
                style={{ width: 220, height: 160 }}
                resizeMode="cover"
                onError={(e) => console.warn('[Chat] Image load error:', e.nativeEvent.error)}
              />
            </Pressable>
          );
        case 'action':
          return (
            <View className="flex-col gap-2 mt-1 min-w-[200px]">
                {msg.text && (
                     <View className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 rounded-tl-none mb-2">
                        {msg.isAnimating ? (
                            <TypewriterText 
                                text={msg.text} 
                                className="text-base text-gray-800" 
                                onComplete={handleStreamingComplete}
                            />
                        ) : (
                            <Text className="text-base text-gray-800">{msg.text}</Text>
                        )}
                     </View>
                )}
              {msg.actions?.map((action, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => onAction(action)}
                  className="group bg-white border border-[#5AC8FA] py-3 px-4 rounded-xl items-center flex-row justify-center active:bg-[#5AC8FA] active:opacity-90 shadow-sm"
                >
                  <Text className="text-[#5AC8FA] font-bold text-base group-active:text-white">{action.label}</Text>
                </Pressable>
              ))}
            </View>
          );
        case 'text':
        default:
          return (
            <View className="flex-col gap-2 min-w-[200px] items-start">
              <View
                className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                  msg.sender === 'ai'
                    ? 'bg-gray-100 border border-gray-200 rounded-tl-none'
                    : 'bg-[#4FAAF0] rounded-br-none self-end'
                }`}
              >
                {msg.sender === 'ai' && msg.isAnimating ? (
                    <TypewriterText 
                      text={msg.text || ''} 
                      className="text-base leading-5 text-gray-800"
                      onComplete={handleStreamingComplete}
                    />
                ) : (
                    <Text className={`text-base leading-5 ${msg.sender === 'ai' ? 'text-gray-800' : 'text-white'}`}>
                      {msg.text || ''}
                    </Text>
                )}
              </View>
            </View>
          );
      }
    };

    return (
        <View className={`flex-row mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && (
                <View className="w-10 h-10 mr-4">
                    <ChatAvatar width={40} height={40} />
                </View>
            )}
            {renderMessageContent()}
        </View>
    );
});
