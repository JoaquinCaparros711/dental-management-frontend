import { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { InAppNotification, NotificationType } from '@/types/notification.types';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: number) => void;
  onClearReadNotifications?: () => void;
  onSendTestNotification?: () => void;
  isSendingTest?: boolean;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'DAILY_SUMMARY':
      return {
        name: 'calendar' as const,
        color: '#38BDF8',
        bg: 'bg-sky-500/15 border border-sky-400/30',
        glow: '#38BDF8',
      };
    case 'APPOINTMENT_REMINDER':
      return {
        name: 'alarm' as const,
        color: '#F59E0B',
        bg: 'bg-amber-500/15 border border-amber-400/30',
        glow: '#F59E0B',
      };
    case 'SYSTEM':
    default:
      return {
        name: 'information-circle' as const,
        color: '#A78BFA',
        bg: 'bg-purple-500/15 border border-purple-400/30',
        glow: '#A78BFA',
      };
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateString;
  }
};

export const NotificationModal = ({
  visible,
  onClose,
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearReadNotifications,
  onSendTestNotification,
  isSendingTest,
}: NotificationModalProps) => {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filteredNotifications = notifications.filter((item) =>
    filter === 'UNREAD' ? !item.isRead : true
  );

  const handleMarkAsRead = useCallback(
    (id: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMarkAsRead(id);
    },
    [onMarkAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onMarkAllAsRead();
  }, [onMarkAllAsRead]);

  const handleDeleteNotification = useCallback(
    (id: number) => {
      if (onDeleteNotification) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDeleteNotification(id);
      }
    },
    [onDeleteNotification]
  );

  const handleClearReadNotifications = useCallback(() => {
    if (onClearReadNotifications) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClearReadNotifications();
    }
  }, [onClearReadNotifications]);

  const handleTestNotification = useCallback(() => {
    if (onSendTestNotification) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSendTestNotification();
    }
  }, [onSendTestNotification]);

  const renderNotificationItem = useCallback(
    ({ item }: { item: InAppNotification }) => {
      const iconConfig = getNotificationIcon(item.type);

      return (
        <View
          className={`p-4 rounded-[22px] mb-3.5 border-[1.5px] ${
            item.isRead
              ? 'bg-white/[0.035] border-white/8'
              : 'bg-sky-500/[0.08] border-sky-400/30'
          }`}
          style={{
            shadowColor: item.isRead ? '#000000' : '#38BDF8',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: item.isRead ? 0.2 : 0.35,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View className="flex-row items-start">
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => !item.isRead && handleMarkAsRead(item.id)}
              className="flex-row items-start flex-1"
            >
              <View className={`w-11 h-11 rounded-2xl items-center justify-center mr-3.5 ${iconConfig.bg}`}>
                <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
              </View>

              <View className="flex-1 pr-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`font-sans-bold text-base flex-1 ${item.isRead ? 'text-white/80' : 'text-white'}`}>
                    {item.title}
                  </Text>
                  {!item.isRead && (
                    <View
                      className="w-2.5 h-2.5 rounded-full bg-sky-400 ml-2"
                      style={{
                        shadowColor: '#38BDF8',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 6,
                      }}
                    />
                  )}
                </View>

                <Text className="text-white/60 text-sm leading-[21px] font-sans mb-2.5">{item.message}</Text>

                <View className="flex-row items-center justify-between">
                  <Text className="text-white/35 text-xs font-sans">{formatDate(item.createdAt)}</Text>
                  {!item.isRead && (
                    <Text className="text-sky-400 text-xs font-sans-semibold">Marcar como leída</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {onDeleteNotification && (
              <TouchableOpacity
                onPress={() => handleDeleteNotification(item.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="p-2 rounded-xl bg-white/[0.05] border border-white/10 items-center justify-center ml-1"
              >
                <Ionicons name="trash-outline" size={17} color="#F87171" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [handleMarkAsRead, handleDeleteNotification, onDeleteNotification]
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/75">
        <View className="bg-[#07111D] border-t-[1.5px] border-white/10 rounded-t-[36px] h-[85%] p-6 relative overflow-hidden">
          {/* Ambient Liquid Glass Glowing Orbs */}
          <View
            className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-[rgba(45,212,191,0.14)]"
            style={{
              shadowColor: '#2DD4BF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 100,
            }}
          />
          <View
            className="absolute bottom-10 -left-10 w-64 h-64 rounded-full bg-[rgba(56,189,248,0.12)]"
            style={{
              shadowColor: '#38BDF8',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 100,
            }}
          />

          {/* Top Handle Indicator */}
          <View className="items-center mb-3">
            <View className="w-12 h-1.5 rounded-full bg-white/20" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-white/10 mb-5">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 items-center justify-center">
                <Ionicons name="notifications" size={22} color="#38BDF8" />
              </View>
              <Text className="text-white text-2xl font-sans-bold tracking-[0.3px]">Notificaciones</Text>
            </View>

            <View className="flex-row items-center gap-2.5">
              {onSendTestNotification && (
                <TouchableOpacity
                  onPress={handleTestNotification}
                  disabled={isSendingTest}
                  className="bg-sky-500/20 border border-sky-400/40 px-3.5 py-2 rounded-xl flex-row items-center"
                  style={{
                    shadowColor: '#38BDF8',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                  }}
                >
                  <Ionicons name="flash" size={14} color="#38BDF8" style={{ marginRight: 5 }} />
                  <Text className="text-sky-300 text-xs font-sans-bold">
                    {isSendingTest ? 'Enviando...' : 'Probar'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sub-header Filter Tabs & Actions */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row bg-white/[0.035] p-1 rounded-2xl border border-white/8">
              <TouchableOpacity
                onPress={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-xl ${
                  filter === 'ALL' ? 'bg-sky-500/25 border border-sky-400/40' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-xs ${
                    filter === 'ALL' ? 'text-sky-300 font-sans-bold' : 'text-white/45 font-sans-semibold'
                  }`}
                >
                  Todas ({notifications.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilter('UNREAD')}
                className={`px-4 py-2 rounded-xl ${
                  filter === 'UNREAD' ? 'bg-sky-500/25 border border-sky-400/40' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-xs ${
                    filter === 'UNREAD' ? 'text-sky-300 font-sans-bold' : 'text-white/45 font-sans-semibold'
                  }`}
                >
                  No leídas ({notifications.filter((n) => !n.isRead).length})
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-3">
              {onClearReadNotifications && notifications.some((n) => n.isRead) && (
                <TouchableOpacity onPress={handleClearReadNotifications}>
                  <Text className="text-white/40 text-xs font-sans-medium">Limpiar leídas</Text>
                </TouchableOpacity>
              )}

              {notifications.some((n) => !n.isRead) && (
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                  <Text className="text-sky-400 text-xs font-sans-semibold">Leer todas</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#38BDF8" />
            </View>
          ) : filteredNotifications.length === 0 ? (
            <View className="flex-1 items-center justify-center p-6">
              <View
                className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/10 items-center justify-center mb-4"
                style={{
                  shadowColor: '#38BDF8',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 16,
                }}
              >
                <Ionicons name="notifications-off-outline" size={36} color="#64748B" />
              </View>
              <Text className="text-white font-sans-bold text-lg mb-1.5">Sin notificaciones</Text>
              <Text className="text-white/45 text-sm text-center font-sans mb-4 leading-6">
                {filter === 'UNREAD'
                  ? 'No tienes notificaciones pendientes de leer.'
                  : 'Aún no has recibido ninguna notificación.'}
              </Text>

              {onSendTestNotification && (
                <TouchableOpacity
                  onPress={handleTestNotification}
                  disabled={isSendingTest}
                  className="bg-sky-500/20 border border-sky-400/40 px-6 py-3 rounded-2xl flex-row items-center mt-2"
                  style={{
                    shadowColor: '#38BDF8',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Ionicons name="flash" size={18} color="#38BDF8" style={{ marginRight: 8 }} />
                  <Text className="text-sky-300 font-sans-bold text-sm">
                    {isSendingTest ? 'Enviando...' : 'Enviar Notificación de Prueba'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderNotificationItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
