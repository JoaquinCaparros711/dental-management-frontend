import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppAuth } from '@/navigation/AppNavigator';

export default function ProtectedLayout() {
  const { token, isLoading } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/(auth)/login');
    }
  }, [token, isLoading]);

  if (isLoading || !token) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0F1E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
