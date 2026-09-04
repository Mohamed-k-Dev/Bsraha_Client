import { api } from './axios';

export const getMyMessages = async () => {
  const response = await api.get('/message');
  return response.data;
};