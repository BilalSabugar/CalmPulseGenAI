// utils/alerts.js
import { Platform, Alert as RNAlert } from 'react-native';

// very small event bus the UI host subscribes to
const listeners = new Set();
export const _subscribeAlert = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

const dispatch = (payload) => {
  // If no host mounted, fall back to native/window alerts
  if (listeners.size === 0) {
    if (payload.kind === 'alert') {
      if (Platform.OS === 'web') {
        window.alert([payload.title, payload.message].filter(Boolean).join('\n\n'));
      } else {
        RNAlert.alert(payload.title || '', payload.message || '');
      }
      payload.resolve?.();
    } else {
      if (Platform.OS === 'web') {
        const ok = window.confirm([payload.title, payload.message].filter(Boolean).join('\n\n'));
        payload.resolve?.(ok);
      } else {
        RNAlert.alert(payload.title || '', payload.message || '', [
          { text: payload.cancelText || 'Cancel', style: 'cancel', onPress: () => payload.resolve?.(false) },
          { text: payload.okText || 'OK', onPress: () => payload.resolve?.(true) },
        ]);
      }
    }
    return;
  }
  listeners.forEach((fn) => fn(payload));
};

// Public API
export const showAlert = (title = '', message = '') =>
  new Promise((resolve) => dispatch({ kind: 'alert', title, message, resolve }));

export const showConfirm = (title = '', message = '', okText = 'OK', cancelText = 'Cancel') =>
  new Promise((resolve) => dispatch({ kind: 'confirm', title, message, okText, cancelText, resolve }));
