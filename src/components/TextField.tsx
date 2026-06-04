import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ValidationState = 'valid' | 'invalid' | 'idle';

interface TextFieldProps extends TextInputProps {
  label: string;
  validationState?: ValidationState;
  errorText?: string;
}

export function TextField({ label, validationState = 'idle', errorText, style, onFocus, onBlur, secureTextEntry, ...props }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry);

  const borderClasses = isFocused 
    ? 'border-[#0A84FF]/50' 
    : validationState === 'valid'
      ? 'border-[#34D399]/40'
      : validationState === 'invalid'
        ? 'border-[#F87171]/40'
        : 'border-white/8';

  const bgClasses = isFocused
    ? 'bg-white/5'
    : 'bg-white/2';

  const paddingRightClass = secureTextEntry ? 'pr-12' : 'pr-4';

  return (
    <View className="mb-5">
      <Text className="text-white/50 text-[13px] font-sans-semibold mb-2 tracking-[0.4px] uppercase">{label}</Text>
      <View className="relative w-full">
        <TextInput
          className={`border rounded-[14px] pl-4 py-[15px] text-white text-base font-sans tracking-[0.3px] w-full ${borderClasses} ${bgClasses} ${paddingRightClass}`}
          style={style}
          placeholderTextColor="rgba(255, 255, 255, 0.35)"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={isPasswordHidden}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            className="absolute right-4 h-full justify-center items-center"
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
            activeOpacity={0.6}
          >
            <Ionicons
              name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="rgba(255, 255, 255, 0.45)"
            />
          </TouchableOpacity>
        )}
      </View>
      {validationState === 'invalid' && errorText && (
        <Text className="text-[#F87171] text-xs font-sans-medium mt-1.5 pl-1 tracking-[0.2px]">{errorText}</Text>
      )}
    </View>
  );
}
