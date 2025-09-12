import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore, collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';

// --- helpers ---
function tsToDate(v) {
  if (v?.toDate) return v.toDate();      // Firestore Timestamp
  if (typeof v === 'number') return new Date(v);
  return new Date(v);                     // string/Date
}
function fmtInr(n) {
  return `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
}
function fmtDate(d) {
  const dd = tsToDate(d);
  return dd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function deriveStatus(row) {
  // Prefer explicit field if present
  if (row.status) return row.status;  // "Pending" | "Overdue" | "Paid" | "Under Verification"
  // Backward-compat: map from paymentStatus if you add it later
  if (row.paymentStatus === 'paid') return 'Paid';
  if ((row.verificationStatus || '').toLowerCase() === 'under verification') return 'Under Verification';
  // Compute from due date if nothing else
  const due = tsToDate(row.dueDate || row.createdAt || new Date());
  return due < new Date() ? 'Overdue' : 'Pending';
}

/**
 * Fetch dues for the signed-in user.
 * Shapes to: { id, label, amount: "₹ 12,345", due: "25 Aug 2025", status }
 */
export async function loadUserDues({ max = 100 } = {}) {
  const email = (await AsyncStorage.getItem('email'))?.trim() || '';
  console.log('[dues] email from AsyncStorage =', email);
  if (!email) throw new Error('[dues] No email in storage');

  const db = getFirestore();
  const col = collection(db, 'Payments');

  let snap;
  try {
    // Query ONLY by userId to avoid filtering out your current docs.
    // Order by createdAt desc (fallback to dueDate later if missing).
    const q = query(
      col,
      where('userId', '==', email),
      orderBy('createdAt', 'desc'),
      limit(max)
    );
    snap = await getDocs(q);
  } catch (e) {
    console.warn('[dues] primary query (createdAt) failed, trying dueDate. Error:', e?.code, e?.message);
    try {
      const q2 = query(col, where('userId', '==', email), orderBy('dueDate', 'desc'), limit(max));
      snap = await getDocs(q2);
    } catch (e2) {
      console.warn('[dues] fallback (dueDate) failed, using no order. Error:', e2?.code, e2?.message);
      const q3 = query(col, where('userId', '==', email), limit(max));
      snap = await getDocs(q3);
    }
  }

  const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`[dues] fetched docs = ${raw.length}`);
  if (raw[0]) console.log('[dues] first doc sample =', raw[0]);

  // Client-side sort if server didn’t (handles string/Timestamp dates)
  raw.sort((a, b) => tsToDate(b.dueDate || b.createdAt) - tsToDate(a.dueDate || a.createdAt));

  const rows = raw.map(data => ({
    id: data.id,
    label: data.label || data.description || 'Due',
    amount: fmtInr(data.amount),
    due: fmtDate(data.dueDate || data.createdAt || new Date()), // supports "YYYY-MM-DD" string too
    status: deriveStatus(data),
    _raw: data,
  }));

  console.log('[dues] shaped rows =', rows.length);
  return rows;
}
