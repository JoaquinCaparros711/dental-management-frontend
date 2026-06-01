import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { removeToken, savePendingToast, getPendingToast } from '@/storage/authStorage';
import { useAppAuth } from '@/navigation/AppNavigator';
import { Toast } from '@/components/Toast';
import { ClinicalBackground } from '@/components/ClinicalBackground';

export default function HomeScreen() {
  const router = useRouter();
  const { setToken } = useAppAuth();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    getPendingToast().then((message) => {
      if (message) {
        setToast({ visible: true, message, type: 'success' });
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await savePendingToast('¡Sesión cerrada con éxito!');
    await removeToken();
    setToken(null);
  }, [setToken]);

  return (
    <ClinicalBackground>
      <SafeAreaView style={styles.root}>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
        />
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Text style={styles.logo}>🦷</Text>
            <Text style={styles.appName}>OdontoGestión</Text>
          </View>

          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>¡Bienvenido al sistema!</Text>
            <Text style={styles.welcomeSubtitle}>
              Autenticación JWT verificada correctamente. Tu sesión está activa y protegida.
            </Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Sesión activa</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Panel Principal</Text>
            <Text style={styles.infoCardText}>
              Las funcionalidades del sistema de gestión dental se integrarán aquí en las próximas User Stories del proyecto.
            </Text>
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ClinicalBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 22,
    marginBottom: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  statusText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  infoCardText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 22,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutButtonText: {
    color: '#FCA5A5',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
