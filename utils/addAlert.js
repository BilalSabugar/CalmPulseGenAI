// utils/addAlert.js
import { doc, setDoc } from 'firebase/firestore';
import moment from 'moment';
import db from '../firebase';

export async function addAlert(userId, { type, title, body, meta = {} }) {
  if (!userId) return;
  const ts = moment().format();
  const id = `${userId}@${ts}`; // consistent with your pattern
  const payload = {
    userId,
    type,                 // 'security' | 'document' | 'billing' | 'system'
    title,
    body,
    meta,
    seen: false,
    createdAt: ts,
  };
  await setDoc(doc(db, 'alerts', id), payload);
}
