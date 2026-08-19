export type NotificationType = 'DAILY_SUMMARY' | 'APPOINTMENT_REMINDER' | 'SYSTEM';

export interface InAppNotification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface PushTokenRequestPayload {
  pushToken: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
