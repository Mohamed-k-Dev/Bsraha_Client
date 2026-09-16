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

export const updateProfileInfo = async (data: {
  userName?: string;
  gender?: string;
  age?: number | string;
  address?: string;
  phone?: string;
  birthDate?: string;
}) => {
  const res = await api.patch("/user/update/profile", data);
  return res.data;
};

export const updatePassword = async (data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const res = await api.patch("/user/update/password", data);
  return res.data;
};

export const uploadProfileImageApi = async (file: File) => {
  const formData = new FormData();
  formData.append("profileImage", file);
  const res = await api.patch("/user/upload/profile-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const uploadCoverImagesApi = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("coverImages", file);
  });
  const res = await api.patch("/user/upload/coverImages", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};