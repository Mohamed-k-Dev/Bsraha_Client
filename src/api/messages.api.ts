import { api } from "./axios";

export const getMyMessages = async () => {
  const response = await api.get("/message");
  return response.data?.data?.messages || [];
};
export const getUserStats = async () => {
  const response = await api.get("/message/stats/overview");
  return response.data?.data?.stats;
};
