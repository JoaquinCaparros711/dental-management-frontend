import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { registerPushToken } from '@/services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const registerForPushNotifications = async () => {
      if (Platform.OS === 'web') {
        return;
      }

      if (!Device.isDevice) {
        console.log('Push notifications are only supported on physical devices');
      }

      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('Push notification permission denied');
          return;
        }

        const rawProjectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        const isValidUuid =
          typeof rawProjectId === 'string' &&
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawProjectId);

        let token: string | null = null;
        if (isValidUuid) {
          try {
            const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: rawProjectId });
            token = tokenData.data;
          } catch (tokenError) {
            console.warn('Remote Expo push token fetch failed. Using local fallback token.', tokenError);
            token = 'ExpoPushToken[dev-local-token]';
          }
        } else {
          token = 'ExpoPushToken[dev-local-token]';
        }

        if (isMounted) {
          setExpoPushToken(token);
        }

        if (token) {
          await registerPushToken(token);
          console.log('Expo Push Token registered with backend:', token);
        }
      } catch (error) {
        console.warn('Error during push notification setup:', error);
      }
    };

    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((incomingNotification) => {
      if (isMounted) {
        setNotification(incomingNotification);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('User tapped push notification:', response);
      try {
        router.push('/(protected)/appointments');
      } catch (err) {
        console.error('Failed to navigate on notification tap:', err);
      }
    });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  return {
    expoPushToken,
    notification,
  };
};
