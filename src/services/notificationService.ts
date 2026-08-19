import apiClient from '@/api/apiClient';
import { InAppNotification, PushTokenRequestPayload, UnreadCountResponse } from '@/types/notification.types';

export const registerPushToken = async (pushToken: string): Promise<void> => {
  const payload: PushTokenRequestPayload = { pushToken };
  await apiClient.post('/users/push-token', payload);
};

export const fetchUserNotifications = async (): Promise<InAppNotification[]> => {
  const response = await apiClient.get<InAppNotification[]>('/notifications');
  return response.data;
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const response = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  return response.data.unreadCount;
};

export const markNotificationAsRead = async (id: number): Promise<InAppNotification> => {
  const response = await apiClient.patch<InAppNotification>(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

export const sendTestNotification = async (): Promise<void> => {
  await apiClient.post('/notifications/test');
};

export const deleteNotification = async (id: number): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

export const clearReadNotifications = async (): Promise<void> => {
  await apiClient.delete('/notifications/clear-read');
};
