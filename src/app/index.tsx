import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppAuth } from '@/navigation/AppNavigator';

export default function Index() {
  const router = useRouter();
  const { token, isLoading } = useAppAuth();

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace('/(protected)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [token, isLoading]);

  return (
    <View className="flex-1 bg-[#0A0F1E] justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}
