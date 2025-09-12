// components/Container.jsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useContainerMaxWidth } from './responsive/responsive';

export default function Container({ children, style }) {
  const maxW = useContainerMaxWidth();
  return (
    <View style={[styles.base, { maxWidth: maxW }, style]}>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' ? { boxSizing: 'border-box' } : null),
  },
});
