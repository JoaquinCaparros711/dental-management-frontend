import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_jwt_token';
const FIRST_NAME_KEY = 'auth_first_name';
const LAST_NAME_KEY = 'auth_last_name';
const TOAST_KEY = 'pending_toast_message';

let nativePendingToast: string | null = null;

const getWebStorage = (): Storage | null => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
};

export async function saveToken(token: string): Promise<void> {
  try {
    const storage = getWebStorage();
    if (Platform.OS === 'web') {
      if (storage) storage.setItem(TOKEN_KEY, token);
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save secure auth token:', error);
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeBase64(base64);
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function decodeBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i++) {
    const c = str.charAt(i);
    if (c === '=') break;
    const index = chars.indexOf(c);
    if (index === -1) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

export async function getToken(): Promise<string | null> {
  try {
    const storage = getWebStorage();
    const rawToken = Platform.OS === 'web'
      ? (storage ? storage.getItem(TOKEN_KEY) : null)
      : await SecureStore.getItemAsync(TOKEN_KEY);

    if (rawToken && isTokenExpired(rawToken)) {
      await removeToken();
      await removeUserName();
      await savePendingToast('Tu sesión ha expirado. Por favor ingresa nuevamente.');
      return null;
    }

    return rawToken;
  } catch (error) {
    console.error('Failed to read secure auth token:', error);
    return null;
  }
}

export async function removeToken(): Promise<void> {
  try {
    const storage = getWebStorage();
    if (Platform.OS === 'web') {
      if (storage) storage.removeItem(TOKEN_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove secure auth token:', error);
  }
}

export async function saveUserName(firstName: string, lastName: string): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Failed to save secure user name:', error);
  }
}

export async function getUserName(): Promise<{ firstName: string | null; lastName: string | null }> {
  try {
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
  } catch (error) {
    console.error('Failed to read secure user name:', error);
    return { firstName: null, lastName: null };
  }
}

export async function removeUserName(): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Failed to remove secure user name:', error);
  }
}

export async function savePendingToast(message: string): Promise<void> {
  try {
    const storage = getWebStorage();
    if (Platform.OS === 'web') {
      if (storage) storage.setItem(TOAST_KEY, message);
      return;
    }
    nativePendingToast = message;
  } catch (error) {
    console.error('Failed to save pending toast:', error);
  }
}

export async function getPendingToast(): Promise<string | null> {
  try {
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
  } catch (error) {
    console.error('Failed to read pending toast:', error);
    return null;
  }
}
