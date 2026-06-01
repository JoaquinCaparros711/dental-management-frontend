import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ValidationState = 'valid' | 'invalid' | 'idle';

interface TextFieldProps extends TextInputProps {
  label: string;
  validationState?: ValidationState;
  errorText?: string;
}

const BORDER_COLOR: Record<ValidationState, string> = {
  valid: 'rgba(52, 211, 153, 0.4)',      // Soft emerald glass border
  invalid: 'rgba(248, 113, 113, 0.4)',    // Soft rose glass border
  idle: 'rgba(255, 255, 255, 0.08)',      // Translucent white border
};

export function TextField({ label, validationState = 'idle', errorText, style, onFocus, onBlur, secureTextEntry, ...props }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordHidden, setIsPasswordHidden] = useState(secureTextEntry);

  const activeBorderColor = isFocused 
    ? 'rgba(10, 132, 255, 0.5)' // iOS System Blue glow
    : BORDER_COLOR[validationState];

  const activeBgColor = isFocused
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.02)';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input, 
            { 
              borderColor: activeBorderColor,
              backgroundColor: activeBgColor,
              paddingRight: secureTextEntry ? 48 : 16 // Room for the eye icon
            }, 
            style
          ]}
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
            style={styles.eyeButton}
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
        <Text style={styles.errorText}>{errorText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: 16,
    paddingVertical: 15,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    paddingLeft: 4,
    letterSpacing: 0.2,
  },
});
