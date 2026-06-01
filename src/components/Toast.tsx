import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  bg: string;
  border: string;
  text: string;
  icon: string;
}

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide: () => void;
  duration?: number;
}

const TOAST_STYLES: Record<ToastType, ToastConfig> = {
  success: { 
    bg: 'rgba(10, 35, 20, 0.85)', 
    border: 'rgba(52, 211, 153, 0.25)', 
    text: '#34D399', 
    icon: '✓' 
  },
  error: { 
    bg: 'rgba(45, 10, 10, 0.85)', 
    border: 'rgba(248, 113, 113, 0.25)', 
    text: '#F87171', 
    icon: '✕' 
  },
  info: { 
    bg: 'rgba(15, 23, 42, 0.85)', 
    border: 'rgba(59, 130, 246, 0.25)', 
    text: '#60A5FA', 
    icon: 'ℹ' 
  },
};

export function Toast({ visible, message, type = 'success', onHide, duration = 2500 }: ToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const config = TOAST_STYLES[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg, borderColor: config.border },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={[styles.iconBadge, { borderColor: config.border, backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
        <Text style={[styles.icon, { color: config.text }]}>{config.icon}</Text>
      </View>
      <Text style={[styles.message, { color: '#FFFFFF' }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
