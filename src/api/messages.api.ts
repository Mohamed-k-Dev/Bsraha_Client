import { api } from "./axios";

// export const getMyMessages = async () => {
//   const res = await api.get(`/message`);
//   // Dashboard expects an array to use .slice(0, 4)
//   return res.data?.data?.messages || res.data?.data || [];
// };

// // 2. Used by MyMessagesPage (Returns { messages, pagination } object)
// export const getPaginatedMessages = async ({
//   filter,
//   page
// }: {
//   filter: string;
//   page: number
// }) => {
//   const res = await api.get(`/message`, {
//     params: { filter, page, limit: 10 }
//   });
//   // MyMessagesPage expects the full object for pagination controls
//   return res.data?.data || { messages: [], pagination: {} };
// };

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
