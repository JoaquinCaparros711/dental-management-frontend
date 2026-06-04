import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_jwt_token';

// Web localStorage helper to prevent SSR reference errors
const getWebStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
};

export async function saveToken(token: string): Promise<void> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) storage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    return storage ? storage.getItem(TOKEN_KEY) : null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) storage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

const TOAST_KEY = 'pending_toast_message';
let nativePendingToast: string | null = null;

export async function savePendingToast(message: string): Promise<void> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) storage.setItem(TOAST_KEY, message);
    return;
  }
  nativePendingToast = message;
}

export async function getPendingToast(): Promise<string | null> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) {
      const val = storage.getItem(TOAST_KEY);
      if (val) storage.removeItem(TOAST_KEY);
      return val;
    }
    return null;
  }
  const val = nativePendingToast;
  nativePendingToast = null;
  return val;
}
