import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
