import { api } from './axios';
import type { ReactionType } from '@/types';

interface ReactPayload {
  targetType: 'message' | 'reply';
  targetId: string;
  type: ReactionType;
}

export const reactToTarget = async ({ targetType, targetId, type }: ReactPayload) => {
  const response = await api.post(`/reaction/${targetType}/${targetId}`, { type });
  return response.data;
};

export const removeReaction = async ({ targetType, targetId }: Omit<ReactPayload, 'type'>) => {
  const response = await api.delete(`/reaction/${targetType}/${targetId}`);
  return response.data;
};