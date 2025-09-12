// components/PayDueModal.jsx
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore, doc, updateDoc, serverTimestamp,
  collection, addDoc
} from 'firebase/firestore';
import { useThemeMode } from './theme/ThemeProvider';

/* ===================== Theming ===================== */
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
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
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
        danger: '#ef4444',
        success: '#16a34a',
        warning: '#d97706',
      };
}
const makeStyles = (P) =>
  StyleSheet.create({
    modal: { margin: 16, justifyContent: 'center' },
    card: { backgroundColor: P.card, borderRadius: 16, borderWidth: 1, borderColor: P.border, padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 16, fontWeight: '800', color: P.text },
    sub: { marginTop: 4, color: P.textMuted, fontSize: 12 },

    sectionTitle: { marginTop: 16, fontSize: 13, fontWeight: '700', color: P.text },
    pillRow: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
      borderWidth: 1, borderColor: P.chipBorder, backgroundColor: P.chipBg,
    },
    pillActive: { backgroundColor: P.primary, borderColor: P.primary },
    pillTxt: { color: P.text, fontWeight: '700', fontSize: 12 },
    pillTxtActive: { color: P.primaryText },

    inputWrap: {
      marginTop: 10, height: 44, borderRadius: 10, borderWidth: 1,
      borderColor: P.inputBorder, backgroundColor: P.inputBg,
      paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    input: { flex: 1, color: P.text, fontSize: 14, height: '100%', paddingLeft: 25 },

    help: { marginTop: 6, color: P.textMuted, fontSize: 11 },
    hintOk: { color: P.success },
    hintWarn: { color: P.warning },
    hintBad: { color: P.danger },

    footerRow: { marginTop: 16, flexDirection: 'row', gap: 10 },
    btn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: P.chipBorder, alignItems: 'center' },
    btnText: { color: P.text, fontWeight: '800' },
    btnPrimary: { backgroundColor: P.primary, borderColor: P.primary },
    btnPrimaryText: { color: P.primaryText, fontWeight: '800' },

    closeBtn: {
      width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: P.border, backgroundColor: P.inputBg,
    },
  });

/* ===================== Helpers & Heuristics ===================== */
function normalizeAmount(a) {
  const n = Number(String(a ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : NaN;
}
function plausibleUPIRef(ref) {
  if (!ref) return false;
  const s = String(ref).trim().toUpperCase();
  if (!/^[A-Z0-9]{12,16}$/.test(s)) return false;
  if (!(/[A-Z]/.test(s) && /\d/.test(s))) return false;
  return true;
}
/** Heuristic only for **display & admin context**. We will NOT auto-mark paid. */
function decideAutoVerification({ dueAmount, paidAmount, upiRef, paidAt = new Date() }) {
  const A = normalizeAmount(dueAmount);
  const P = normalizeAmount(paidAmount);
  const amountOK = Number.isFinite(A) && Number.isFinite(P) && P >= A * 0.98 && P <= A * 1.02;
  const refOK = plausibleUPIRef(upiRef);
  const deltaDays = Math.abs((new Date(paidAt) - new Date()) / (1000 * 60 * 60 * 24));
  const recencyOK = deltaDays <= 3;
  const score = [amountOK, refOK, recencyOK].filter(Boolean).length;
  return { amountOK, refOK, recencyOK, score, auto: score >= 2 };
}

/* ===================== Component ===================== */
export default function PayDueModal({ visible, onClose, due, onUpdated }) {
  const { isDark } = useThemeMode();
  const P = useMemo(() => buildPalette(isDark), [isDark]);
  const styles = useMemo(() => makeStyles(P), [P]);

  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CASH'
  const [amount, setAmount] = useState('');
  const [upiRef, setUpiRef] = useState('');

  const dueAmountNum = normalizeAmount(due?._raw?.amount ?? due?.amount);
  const upiCheck = decideAutoVerification({
    dueAmount: dueAmountNum,
    paidAmount: amount,
    upiRef,
    paidAt: new Date(),
  });

  const canSubmit =
    (method === 'UPI' && normalizeAmount(amount) > 0 && plausibleUPIRef(upiRef)) ||
    (method === 'CASH' && normalizeAmount(amount) > 0);

  const handleSubmit = async () => {
    try {
      if (!due?.id) throw new Error('Missing due.id (Payments doc id)');
      const email = (await AsyncStorage.getItem('email'))?.trim();
      if (!email) throw new Error('Not authenticated');

      const db = getFirestore();
      const ref = doc(db, 'Payments', String(due.id));

      const paidAmountNum = normalizeAmount(amount);

      // 1) Audit row in subcollection for admin review
      await addDoc(collection(db, 'Payments', String(due.id), 'submissions'), {
        type: 'client_submission',
        method,                       // 'UPI' | 'CASH'
        submittedBy: email,
        submittedAt: serverTimestamp(),
        paidAmount: paidAmountNum,
        upi: method === 'UPI' ? { ref: String(upiRef).trim().toUpperCase() } : null,
        rules: {                      // store heuristics for admin to see
          amountOK: upiCheck.amountOK,
          refOK: upiCheck.refOK,
          recencyOK: upiCheck.recencyOK,
          score: upiCheck.score,
          auto: upiCheck.auto
        },
        source: Platform.OS,
      });

      // 2) Update Payment doc → Under Verification (do NOT auto-mark paid)
      await updateDoc(ref, {
        status: 'Under Verification',      // used by your UI filters
        paymentStatus: 'due',              // stays due until admin marks paid
        paymentMethod: method,
        paidAmount: paidAmountNum,         // provisional; admin can override
        verification: {
          state: 'submitted',
          method,
          reviewRequired: true,
          submittedBy: email,
          submittedAt: serverTimestamp(),
          upiRef: method === 'UPI' ? String(upiRef).trim().toUpperCase() : null,
          rules: {
            amountOK: upiCheck.amountOK,
            refOK: upiCheck.refOK,
            recencyOK: upiCheck.recencyOK,
            score: upiCheck.score,
            auto: upiCheck.auto
          }
        },
        updatedAt: serverTimestamp(),
        updatedBy: email,
      });

      // 3) Optimistic UI update
      onUpdated?.({
        id: due.id,
        label: due.label,
        amount: due.amount, // keep existing display format
        due: due.due,
        status: 'Under Verification',
        _raw: { ...(due._raw || {}), paymentMethod: method, paidAmount: paidAmountNum },
      });

      onClose?.();
    } catch (e) {
      console.error('PayDueModal submit error:', e);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={1}
      backdropColor={P.overlay}
      useNativeDriver
      style={styles.modal}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Pay Due</Text>
            <Text style={styles.sub}>{due?.label}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={16} color={P.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Select payment method</Text>
        <View className="pillRow" style={styles.pillRow}>
          <TouchableOpacity
            onPress={() => setMethod('UPI')}
            activeOpacity={0.9}
            style={[styles.pill, method === 'UPI' && styles.pillActive]}
          >
            <Feather name="smartphone" size={16} color={method === 'UPI' ? P.primaryText : P.text} />
            <Text style={[styles.pillTxt, method === 'UPI' && styles.pillTxtActive]}>UPI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMethod('CASH')}
            activeOpacity={0.9}
            style={[styles.pill, method === 'CASH' && styles.pillActive]}
          >
            <Feather name="dollar-sign" size={16} color={method === 'CASH' ? P.primaryText : P.text} />
            <Text style={[styles.pillTxt, method === 'CASH' && styles.pillTxtActive]}>Cash</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Amount paid</Text>
        <View style={styles.inputWrap}>
          <Feather name="hash" size={16} color={P.textMuted} />
          <TextInput
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            placeholder={`e.g. ${due?.amount || '45000'}`}
            placeholderTextColor={P.textMuted}
            style={styles.input}
          />
        </View>

        {method === 'UPI' && (
          <>
            <Text style={styles.sectionTitle}>UPI Transaction / UTR</Text>
            <View style={styles.inputWrap}>
              <Feather name="credit-card" size={16} color={P.textMuted} />
              <TextInput
                autoCapitalize="characters"
                value={upiRef}
                onChangeText={(t) => setUpiRef(t.toUpperCase())}
                placeholder="12–16 characters (letters & digits)"
                placeholderTextColor={P.textMuted}
                style={styles.input}
              />
            </View>

            {/* live verification hints (display only; payment still goes under verification) */}
            <Text style={[styles.help, upiCheck.amountOK ? styles.hintOk : styles.hintBad]}>
              {upiCheck.amountOK ? '✔ Amount matches due (±2%).' : '✖ Amount is outside ±2% of due.'}
            </Text>
            <Text style={[styles.help, upiCheck.refOK ? styles.hintOk : styles.hintBad]}>
              {upiCheck.refOK ? '✔ UPI/UTR format looks valid.' : '✖ Reference must be 12–16 A–Z/0–9 with letters & digits.'}
            </Text>
            <Text style={[styles.help, upiCheck.recencyOK ? styles.hintOk : styles.hintWarn]}>
              {upiCheck.recencyOK ? '✔ Recent payment (≤ 3 days).' : '△ Payment appears older than 3 days.'}
            </Text>
            <Text style={[styles.help, /* always warn that it's manual now */ styles.hintWarn]}>
              This submission will be placed under verification for manual review.
            </Text>
          </>
        )}

        {method === 'CASH' && (
          <Text style={[styles.help, styles.hintWarn]}>
            Cash submissions are placed under verification. Please keep the receipt handy for confirmation.
          </Text>
        )}

        <View style={styles.footerRow}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.9} style={styles.btn}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!canSubmit}
            onPress={handleSubmit}
            activeOpacity={0.9}
            style={[styles.btn, styles.btnPrimary, { opacity: canSubmit ? 1 : 0.5 }]}
          >
            <Text style={styles.btnPrimaryText}>Submit for Verification</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
