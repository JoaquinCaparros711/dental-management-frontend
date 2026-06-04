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

const FIRST_NAME_KEY = 'auth_first_name';
const LAST_NAME_KEY = 'auth_last_name';

export async function saveUserName(firstName: string, lastName: string): Promise<void> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) {
      storage.setItem(FIRST_NAME_KEY, firstName);
      storage.setItem(LAST_NAME_KEY, lastName);
    }
    return;
  }
  await SecureStore.setItemAsync(FIRST_NAME_KEY, firstName);
  await SecureStore.setItemAsync(LAST_NAME_KEY, lastName);
}

export async function getUserName(): Promise<{ firstName: string | null; lastName: string | null }> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) {
      return {
        firstName: storage.getItem(FIRST_NAME_KEY),
        lastName: storage.getItem(LAST_NAME_KEY),
      };
    }
    return { firstName: null, lastName: null };
  }
  const firstName = await SecureStore.getItemAsync(FIRST_NAME_KEY);
  const lastName = await SecureStore.getItemAsync(LAST_NAME_KEY);
  return { firstName, lastName };
}

export async function removeUserName(): Promise<void> {
  const storage = getWebStorage();
  if (Platform.OS === 'web') {
    if (storage) {
      storage.removeItem(FIRST_NAME_KEY);
      storage.removeItem(LAST_NAME_KEY);
    }
    return;
  }
  await SecureStore.deleteItemAsync(FIRST_NAME_KEY);
  await SecureStore.deleteItemAsync(LAST_NAME_KEY);
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
