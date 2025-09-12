import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ConfirmModal({ visible, onClose, title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, danger = false }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={cm.overlay}>
        <View style={cm.card}>
          <Text style={cm.title}>{title}</Text>
          <Text style={cm.msg}>{message}</Text>
          <View style={cm.row}>
            <TouchableOpacity onPress={onClose} style={[cm.btn, cm.outline]}> 
              <Text style={cm.btnTxtOutline}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={[cm.btn, danger ? cm.danger : cm.primary]}> 
              <Text style={cm.btnTxt}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#0b1220', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', borderRadius: 14, padding: 16 },
  title: { color: '#e5e7eb', fontWeight: '800', fontSize: 16 },
  msg: { color: '#cbd5e1', marginTop: 8, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  btn: { paddingHorizontal: 14, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  outline: { borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)' },
  primary: { backgroundColor: '#22d3ee' },
  danger: { backgroundColor: '#ef4444' },
  btnTxt: { color: '#0b1220', fontWeight: '800' },
  btnTxtOutline: { color: '#cbd5e1', fontWeight: '700' },
});
