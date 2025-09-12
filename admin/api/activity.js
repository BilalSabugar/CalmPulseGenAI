// admin/api/activity.js
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import db from '../../firebase';

export async function logActivity(action, meta = {}, actorEmail = null) {
  try {
    await addDoc(collection(db, 'Activity'), {
      action,
      meta,
      actorEmail,
      at: new Date(), // fine for most cases; replace with serverTimestamp() if you prefer
    });
  } catch (e) {
    console.warn('logActivity failed:', e?.message || e);
  }
}

export function listenRecentActivity(cb, limitN = 10) {
  return onSnapshot(collection(db, 'Activity'), (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (new Date(b.at?.toDate?.() || b.at) - new Date(a.at?.toDate?.() || a.at)))
      .slice(0, limitN);
    cb(list);
  }, () => cb([]));
}
