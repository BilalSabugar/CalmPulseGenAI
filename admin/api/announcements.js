// admin/api/announcements.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import db from '../../firebase';
import { logActivity } from './activity';

const COL = 'announcements';

export function listenAnnouncements(cb) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(list);
  });
}

export async function createAnnouncement(text, actorEmail) {
  const body = (text || '').trim();
  if (!body) throw new Error('Announcement cannot be empty.');
  if (body.length > 200) throw new Error('Max 200 characters.');
  const ref = await addDoc(collection(db, COL), {
    text: body,
    createdAt: serverTimestamp(),
    updatedAt: null,
    createdBy: actorEmail || null,
  });
  await logActivity('announcement_created', { id: ref.id, text: body }, actorEmail);
  return ref.id;
}

export async function updateAnnouncement(id, text, actorEmail) {
  const body = (text || '').trim();
  if (!id) throw new Error('Missing id.');
  if (!body) throw new Error('Announcement cannot be empty.');
  if (body.length > 200) throw new Error('Max 200 characters.');
  await updateDoc(doc(db, COL, id), { text: body, updatedAt: serverTimestamp() });
  await logActivity('announcement_updated', { id, text: body }, actorEmail);
}

export async function deleteAnnouncement(id, actorEmail) {
  if (!id) throw new Error('Missing id.');
  await deleteDoc(doc(db, COL, id));
  await logActivity('announcement_deleted', { id }, actorEmail);
}
