import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendTestNotification,
  deleteNotification,
  clearReadNotifications,
} from '@/services/notificationService';
import { InAppNotification } from '@/types/notification.types';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'];

export const useInAppNotifications = () => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<InAppNotification[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchUserNotifications,
    refetchInterval: 30000, // Poll every 30s as fallback
  });

  const unreadCountQuery = useQuery<number>({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 15000, // Poll every 15s for unread badge updates
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const triggerTestNotificationMutation = useMutation({
    mutationFn: sendTestNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const clearReadNotificationsMutation = useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  return {
    notifications: notificationsQuery.data ?? [],
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    unreadCount: unreadCountQuery.data ?? 0,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearReadNotifications: clearReadNotificationsMutation.mutate,
    triggerTestNotification: triggerTestNotificationMutation.mutate,
    isSendingTest: triggerTestNotificationMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
    refetch: () => {
      notificationsQuery.refetch();
      unreadCountQuery.refetch();
    },
  };
};
