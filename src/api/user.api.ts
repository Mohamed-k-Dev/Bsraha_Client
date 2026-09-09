import { api } from "./axios";

export const getUserProfileByDisplayName = async (displayName: string) => {
  const res = await api.get(`/user/profile/${displayName}`);
  return res.data?.data;
};

export const getUserProfile = async () => {
  const res = await api.get(`/user/profile`);
  return res.data?.data?.user;
};

export const searchUsers = async ({
  q,
  pageParam = 1,
}: {
  q: string;
  pageParam?: number;
}) => {
  // FIX: Added /user/ to match your backend userRouter
  const res = await api.get(`/user/search`, {
    params: { q, page: pageParam, limit: 10 },
  });
  return res.data?.data || { users: [], pagination: {} };
};
