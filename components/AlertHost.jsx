// components/AlertHost.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { registerAlertHost } from '../utils/alerts';
import { useThemeMode } from './theme/ThemeProvider'; // optional, for dark mode

export default function AlertHost() {
  const { isDark } = useThemeMode?.() ?? { isDark: false };
  const C = palette(isDark);

  const [modal, setModal] = useState({
    visible: false,
    type: 'alert', // 'alert' | 'confirm'
    title: '',
    message: '',
    okText: 'OK',
    cancelText: 'Cancel',
    resolver: null, // (value: boolean) => void
  });

  const a = useRef(new Animated.Value(0)).current;

  const open = () => {
    Animated.timing(a, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  };
  const close = (cb) => {
    Animated.timing(a, { toValue: 0, duration: 160, useNativeDriver: true }).start(({ finished }) => {
      if (finished) cb?.();
    });
  };

  // Register host so utils/alerts.js can call into here
  useEffect(() => {
    const unregister = registerAlertHost(async (payload) => {
      // payload: { type, title, message, okText, cancelText }
      return new Promise((resolve) => {
        setModal({
          visible: true,
          resolver: resolve,
          type: payload.type || 'alert',
          title: payload.title || '',
          message: payload.message || '',
          okText: payload.okText || 'OK',
          cancelText: payload.cancelText || 'Cancel',
        });
        // animate in after state mounts
        requestAnimationFrame(open);
      });
    });
    return unregister;
  }, []);

  const onConfirm = () => {
    const res = modal.resolver;
    close(() =>
      setModal((m) => ({ ...m, visible: false, resolver: null }))
    );
    res?.(true);
  };

  const onCancel = () => {
    const res = modal.resolver;
    close(() =>
      setModal((m) => ({ ...m, visible: false, resolver: null }))
    );
    res?.(false);
  };

  if (!modal.visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Blur overlay */}
      <BlurView
        intensity={28}
        tint={isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, styles.blur]}
        experimentalBlurMethod="none"
      />

      {/* Centered card */}
      <Animated.View
        style={[
          styles.center,
          {
            opacity: a,
            transform: [
              {
                scale: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1],
                }),
              },
              {
                translateY: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          {!!modal.title && <Text style={[styles.title, { color: C.text }]}>{modal.title}</Text>}
          {!!modal.message && (
            <Text style={[styles.message, { color: C.muted }]}>{modal.message}</Text>
          )}

          <View style={styles.actions}>
            {modal.type === 'confirm' && (
              <Pressable
                onPress={onCancel}
                style={[styles.btn, { borderColor: C.border, backgroundColor: C.btnGhost }]}
              >
                <Text style={[styles.btnTxt, { color: C.text }]}>{modal.cancelText}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onConfirm}
              style={[styles.btnPrimary, { backgroundColor: C.primary }]}
            >
              <Text style={[styles.btnPrimaryTxt]}>{modal.okText}</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const palette = (dark) => ({
  card: dark ? '#0f172a' : '#ffffff',
  border: dark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.12)',
  text: dark ? '#e5e7eb' : '#0f172a',
  muted: dark ? '#9ca3af' : '#475569',
  primary: dark ? '#ffffff' : '#0f172a',
  btnGhost: dark ? 'rgba(2,6,23,0.35)' : '#F1F5F9',
});

const styles = StyleSheet.create({
  blur: {
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(10px)' } : null),
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '92%',
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: '800' },
  message: { fontSize: 13, lineHeight: 18, marginTop: 8 },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnTxt: { fontWeight: '700', fontSize: 13 },
  btnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPrimaryTxt: { fontWeight: '800', fontSize: 13, color: '#fff' },
});
