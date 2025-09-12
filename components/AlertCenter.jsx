// components/AlertCenter.jsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { _subscribeAlert } from '../utils/alerts';
import { useThemeMode } from './theme/ThemeProvider';
import { height, width } from './constants';

export default function AlertCenter() {
  const { isDark } = useThemeMode?.() || { isDark: false };
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const visible = !!current;

  useEffect(() => _subscribeAlert((payload) => setQueue((q) => [...q, payload])), []);
  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  const close = (result) => {
    try { current?.resolve?.(result); } finally { setCurrent(null); }
  };

  const pal = {
    text:  isDark ? '#e5e7eb' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#475569',
    border: isDark ? 'rgba(148,163,184,0.28)' : 'rgba(15,23,42,0.12)',
    primary: isDark ? '#ffffff' : '#0f172a',
    blur: isDark ? 'dark' : 'light',
    overlay: 'rgba(2,6,23,0.45)',                 // backdrop dim (NO blur)
    // subtle tint above the blur for readability (esp. on Android)
    cardTint: isDark ? 'rgba(15,23,42,0.35)' : 'rgba(255,255,255,0.45)',
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={() => close(false)}>
      <View style={[styles.backdrop, { backgroundColor: pal.overlay }]}>
        {/* Alert card shell (rounded + clipping) */}
        <View style={[styles.cardShell, { maxWidth: width > height ? width / 1.5 : width - 20, borderColor: pal.border }]}>
          {/* Blur only inside the card */}
          <BlurView tint={pal.blur} intensity={40} style={styles.cardBlur} />
          {/* Soft tint over blur for contrast */}
          <View style={[styles.cardTint, { backgroundColor: pal.cardTint }]} />

          {/* Card content */}
          <View style={styles.cardBody}>
            {!!current?.title && (
              <Text style={[styles.title, { color: pal.text }]} numberOfLines={2}>
                {current.title}
              </Text>
            )}
            {!!current?.message && (
              <Text style={[styles.msg, { color: pal.muted }]}>{current.message}</Text>
            )}

            <View style={styles.btnRow}>
              {current?.kind === 'confirm' ? (
                <>
                  <TouchableOpacity
                    onPress={() => close(false)}
                    style={[styles.btn, { borderColor: pal.border }]}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.btnText, { color: pal.text }]}>
                      {current?.cancelText || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => close(true)}
                    style={[styles.btnPrimary, { backgroundColor: pal.primary }]}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.btnPrimaryText, { color: isDark ? '#0b1220' : '#fff' }]}>
                      {current?.okText || 'OK'}
                    </Text>
                    <Feather name="check" size={16} color={isDark ? '#0b1220' : '#fff'} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => close(true)}
                  style={[styles.btnPrimary, { backgroundColor: pal.primary }]}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.btnPrimaryText, { color: isDark ? '#0b1220' : '#fff' }]}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const R = 16;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    alignSelf: 'center',
    paddingHorizontal: 12,
  },

  // A rounded, clipping container so blur stays INSIDE the card
  cardShell: {
    width: '100%',
    borderWidth: 1,
    borderRadius: R,
    overflow: 'hidden',
  },

  // Full-bleed blur layer inside the card
  cardBlur: {
    ...StyleSheet.absoluteFillObject,
  },

  // Subtle tint over blur (helps on platforms where blur is faint)
  cardTint: {
    ...StyleSheet.absoluteFillObject,
  },

  // Padded content on top
  cardBody: {
    padding: 16,
  },

  title: { fontSize: 18, fontWeight: '800' },
  msg:   { marginTop: 8, fontSize: 14, lineHeight: 20 },

  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  btnText: { fontWeight: '700' },
  btnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnPrimaryText: { fontWeight: '900' },
});
