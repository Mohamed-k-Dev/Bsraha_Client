import { api } from "./axios";

export const getUserProfileByDisplayName = async (displayName: string) => {
  const res = await api.get(`/user/profile/${displayName}`);
  return res.data?.data;
};

export const getUserProfile = async () => {
  const res = await api.get(`/user/profile`);
  return res.data?.data?.user;
};
