import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onHide: () => void;
  duration?: number;
}

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
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
  }, [visible, onHide, duration]);

  if (!visible) return null;

  const containerClasses = {
    success: 'bg-[#0A2314]/85 border-[#34D399]/25',
    error: 'bg-[#2D0A0A]/85 border-[#F87171]/25',
    info: 'bg-[#0F172A]/85 border-[#3B82F6]/25',
  }[type];

  const borderClass = {
    success: 'border-[#34D399]/25',
    error: 'border-[#F87171]/25',
    info: 'border-[#3B82F6]/25',
  }[type];

  const textClass = {
    success: 'text-[#34D399]',
    error: 'text-[#F87171]',
    info: 'text-[#60A5FA]',
  }[type];

  const icon = TOAST_ICONS[type];

  return (
    <Animated.View
      className={`absolute top-14 left-5 right-5 z-[999] flex-row items-center gap-3 px-4 py-3.5 rounded-[14px] border shadow-black elevation-8 ${containerClasses}`}
      style={{
        transform: [{ translateY }],
        opacity,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      }}
    >
      <View className={`w-7 h-7 rounded-full border-[1.5px] justify-center items-center bg-white/3 ${borderClass}`}>
        <Text className={`text-sm font-sans-bold ${textClass}`}>{icon}</Text>
      </View>
      <Text className="flex-1 text-sm font-sans-semibold text-white leading-5">{message}</Text>
    </Animated.View>
  );
}
