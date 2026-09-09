import { api } from "./axios";

export const getMessages = async (params?: {
  filter?: string;
  page?: number;
  limit?: number;
}) => {
  const res = await api.get(`/message`, {
    params: {
      filter: params?.filter || "all",
      page: params?.page || 1,
      limit: params?.limit || 10,
    },
  });
  return res.data?.data || { messages: [], pagination: {} };
};

export const getMessageById = async (messageId: string) => {
  const res = await api.get(`/message/${messageId}`);
  return res.data?.data?.message || null;
};

export const getUserStats = async () => {
  const response = await api.get("/message/stats/overview");
  return response.data?.data?.stats;
};

export const sendMessage = async ({
  displayName,
  content,
  isAnonymous,
}: {
  displayName: string;
  content: string;
  isAnonymous: boolean;
}) => {
  const res = await api.post(`/message/send/to/${encodeURIComponent(displayName)}`, {
    content,
    isAnonymous,
  });
  return res.data;
};
