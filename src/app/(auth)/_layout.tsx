import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppAuth } from '@/navigation/AppNavigator';

export default function AuthLayout() {
  const { token, isLoading } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token) {
      router.replace('/(protected)/home');
    }
  }, [token, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
