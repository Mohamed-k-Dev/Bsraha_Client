import { api } from "./axios";

export const getNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const res = await api.get(`/notification`, {
    params: { page, limit },
  });
  return (
    res.data?.data || { notifications: [], unreadCount: 0, pagination: {} }
  );
};

export const markNotificationRead = async (notificationId: string) => {
  const res = await api.patch(`/notification/${notificationId}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch(`/notification/read-all`);
  return res.data;
};
