import React from 'react';
import { View } from 'react-native';

interface ClinicalBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export function ClinicalBackground({ children, style }: ClinicalBackgroundProps) {
  return (
    <View className="flex-1 bg-[#050E17]" style={style}>
      <View
        className="absolute top-[5%] -right-[100px] w-[320px] h-[320px] rounded-[160px] bg-[rgba(45,212,191,0.13)]"
        style={{
          shadowColor: '#2DD4BF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 120,
          elevation: 20,
        }}
      />
      <View
        className="absolute bottom-[5%] -left-[100px] w-[340px] h-[340px] rounded-[170px] bg-[rgba(56,189,248,0.12)]"
        style={{
          shadowColor: '#38BDF8',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 120,
          elevation: 20,
        }}
      />
      {children}
    </View>
  );
}
