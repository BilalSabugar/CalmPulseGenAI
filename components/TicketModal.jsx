import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc } from 'firebase/firestore';
import db from '../firebase';
import { useThemeMode } from './theme/ThemeProvider';
import moment from 'moment';

// —— Theme palette same shape as other screens ——
function buildPalette(isDark) {
  return isDark
    ? {
        overlay: 'rgba(0,0,0,0.7)',
        card: '#0f172a',
        border: '#1f2937',
        text: '#E5E7EB',
        textMuted: '#94A3B8',
        inputBg: '#0b1220',
        inputBorder: '#1f2937',
        chipBg: 'rgba(2,6,23,0.35)',
        chipBorder: '#334155',
        primary: '#FFFFFF',
        primaryText: '#0f172a',
        warn: '#f59e0b',
        danger: '#ef4444',
        accent: '#22c55e',
      }
    : {
        overlay: 'rgba(0,0,0,0.45)',
        card: '#ffffff',
        border: '#e5e7eb',
        text: '#0f172a',
        textMuted: '#64748b',
        inputBg: '#f8fafc',
        inputBorder: '#e5e7eb',
        chipBg: '#f8fafc',
        chipBorder: '#cbd5e1',
        primary: '#0f172a',
        primaryText: '#ffffff',
        warn: '#d97706',
        danger: '#ef4444',
        accent: '#16a34a',
      };
}

const makeStyles = (P) => StyleSheet.create({
  modal: { margin: 16, justifyContent: 'center' },
  card: { backgroundColor: P.card, borderRadius: 16, borderWidth: 1, borderColor: P.border, padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '800', color: P.text },
  sub: { marginTop: 4, color: P.textMuted, fontSize: 12 },

  section: { marginTop: 14 },
  label: { fontSize: 12, color: P.textMuted, marginBottom: 6 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1, borderColor: P.inputBorder,
    backgroundColor: P.inputBg, paddingHorizontal: 12, color: P.text, fontSize: 14,
  },
  textarea: {
    minHeight: 90, borderRadius: 10, borderWidth: 1, borderColor: P.inputBorder,
    backgroundColor: P.inputBg, paddingHorizontal: 12, paddingVertical: 10, color: P.text, fontSize: 14,
  },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: P.chipBorder, backgroundColor: P.chipBg,
  },
  typePillActive: { backgroundColor: P.primary, borderColor: P.primary },
  typeTxt: { color: P.text, fontWeight: '700', fontSize: 12 },
  typeTxtActive: { color: P.primaryText },

  footerRow: { marginTop: 16, flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: P.chipBorder,
    alignItems: 'center', backgroundColor: P.chipBg,
  },
  btnTxt: { color: P.text, fontWeight: '800' },
  btnPrimary: { backgroundColor: P.primary, borderColor: P.primary },
  btnPrimaryTxt: { color: P.primaryText, fontWeight: '800' },

  closeBtn: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: P.border, backgroundColor: P.inputBg,
  },

  successWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  successTxt: { marginTop: 12, fontSize: 16, fontWeight: '800', color: P.text },
  successSub: { marginTop: 6, fontSize: 12, color: P.textMuted, textAlign: 'center' },
});

/** 8-char random alnum */
function randomId8() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export default function TicketModal({
  visible,
  onClose,
  transaction,           // { id, amount, ts, invoiceUrl?, receiptUrl? }
  onRaised,              // callback with created ticket doc
}) {
  const { isDark } = useThemeMode();
  const P = useMemo(() => buildPalette(isDark), [isDark]);
  const styles = useMemo(() => makeStyles(P), [P]);

  const [email, setEmail] = useState('');
  const [type, setType] = useState('Wrong Amount');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const e = await AsyncStorage.getItem('email');
      if (e) setEmail(e);
    })();
  }, [visible]);

  useEffect(() => {
    if (done) {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 8 }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [done]);

  const TYPES = [
    'Wrong Amount',
    "Can't download invoice/receipt",
    'Duplicate Transaction',
    'Wrong Reference/UTR',
    'Other',
  ];

  const canSubmit = email && subject && type && !submitting;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const ts = moment().format(); // ISO with offset
      const ticketId = randomId8();
      const docId = `${email}@${ts}`;

      const payload = {
        timestamp: ts,
        ticketType: type,
        userId: email,
        title: subject,
        description: details || '',
        ticketId,
        status: 'Active',
        transactionId: transaction?.id || '',
        transactionAmount: transaction?.amount || null,
        transactionTime: transaction?.ts || null,
        invoiceUrl: transaction?.invoiceUrl || null,
        receiptUrl: transaction?.receiptUrl || null,
        platform: Platform.OS,
      };

      await setDoc(doc(db, 'tickets', docId), payload);

      setDone(true);
      onRaised?.(payload);
    } catch (e) {
      console.error('Ticket submit error:', e);
      // Optional: surface error UI
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setDone(false);
    setSubject('');
    setDetails('');
    setType('Wrong Amount');
    onClose?.();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={resetAndClose}
      backdropOpacity={1}
      backdropColor={P.overlay}
      useNativeDriver
      style={styles.modal}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
    >
      <View style={styles.card}>
        {!done ? (
          <>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Raise a Ticket</Text>
                <Text style={styles.sub}>
                  Transaction: {transaction?.id || '-'}
                </Text>
              </View>
              <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
                <Feather name="x" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Email (non-editable) */}
            <View style={styles.section}>
              <Text style={styles.label}>Your Email</Text>
              <View style={[styles.input, { justifyContent: 'center' }]}>
                <Text style={{ color: P.text, fontSize: 14 }}>{email || '—'}</Text>
              </View>
              <Text style={[styles.sub, { marginTop: 4 }]}>Email is fixed from your account.</Text>
            </View>

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.label}>Issue Type</Text>
              <View style={styles.typeRow}>
                {TYPES.map((t) => {
                  const active = t === type;
                  return (
                    <TouchableOpacity
                      key={t}
                      activeOpacity={0.9}
                      style={[styles.typePill, active && styles.typePillActive]}
                      onPress={() => setType(t)}
                    >
                      <Text style={[styles.typeTxt, active && styles.typeTxtActive]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Subject */}
            <View style={styles.section}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief title (e.g., Invoice shows wrong amount)"
                placeholderTextColor={P.textMuted}
                style={styles.input}
              />
            </View>

            {/* Details */}
            <View style={styles.section}>
              <Text style={styles.label}>Details (optional)</Text>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Share details to help us resolve quicker."
                placeholderTextColor={P.textMuted}
                style={styles.textarea}
                multiline
              />
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity onPress={resetAndClose} activeOpacity={0.9} style={styles.btn}>
                <Text style={styles.btnTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!canSubmit}
                onPress={handleSubmit}
                activeOpacity={0.9}
                style={[styles.btn, styles.btnPrimary, { opacity: canSubmit ? 1 : 0.5 }]}
              >
                <Text style={styles.btnPrimaryTxt}>{submitting ? 'Submitting…' : 'Submit Ticket'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.successWrap}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Feather name="check-circle" size={72} color={P.accent} />
            </Animated.View>
            <Text style={styles.successTxt}>Ticket raised successfully</Text>
            <Text style={styles.successSub}>
              Our team will review and get back to you shortly.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <TouchableOpacity onPress={resetAndClose} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryTxt}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
