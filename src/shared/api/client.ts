import {
  GetContentResponseSchema,
  ChatResponseSchema,
  ChatRequest,
  LocationMarker,
  GuideContent,
} from './contracts';

export const apiClient = {
  sendChatMessage: async (payload: ChatRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = {
      reply: `AI Response to: "${payload.message}". This gate is very historical.`,
    };
    return ChatResponseSchema.parse(response);
  },
};
