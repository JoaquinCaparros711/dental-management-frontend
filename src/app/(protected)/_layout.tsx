import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppAuth } from '@/navigation/AppNavigator';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function ProtectedLayout() {
  const { token, isLoading } = useAppAuth();
  const router = useRouter();
  usePushNotifications();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/(auth)/login');
    }
  }, [token, isLoading]);

  if (isLoading || !token) {
    return (
      <View className="flex-1 bg-[#0A0F1E] justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
