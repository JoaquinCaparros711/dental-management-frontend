import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_jwt_token';

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

const TOAST_KEY = 'pending_toast_message';

export async function savePendingToast(message: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOAST_KEY, message);
    return;
  }
  await SecureStore.setItemAsync(TOAST_KEY, message);
}

export async function getPendingToast(): Promise<string | null> {
  if (Platform.OS === 'web') {
    const val = localStorage.getItem(TOAST_KEY);
    if (val) localStorage.removeItem(TOAST_KEY);
    return val;
  }
  const val = await SecureStore.getItemAsync(TOAST_KEY);
  if (val) await SecureStore.deleteItemAsync(TOAST_KEY);
  return val;
}
