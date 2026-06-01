import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ClinicalBackgroundProps {
  children: React.ReactNode;
  style?: any;
}

export function ClinicalBackground({ children, style }: ClinicalBackgroundProps) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050E17', // Clinical deep slate/teal canvas
  },
  glowTopRight: {
    position: 'absolute',
    top: '5%',
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(45, 212, 191, 0.13)', // Mint Teal / Clinical green glow
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 120,
    elevation: 20,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: '5%',
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(56, 189, 248, 0.12)', // Clean Sky Blue / Sterile cyan glow
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 120,
    elevation: 20,
  },
});
