// admin/api/payments.js
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where, deleteDoc } from 'firebase/firestore';
import db from '../../firebase';

// Live dues for a client (Payments where userId == clientEmail AND paymentStatus == 'due')
export function listenClientDues(clientEmail, cb, limitCount = 50) {
  const q = query(
    collection(db, 'Payments'),
    where('userId', '==', clientEmail),
    where('paymentStatus', '==', 'due'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// Live transactions (Payments where status paid)
export function listenClientTransactions(clientEmail, cb, limitCount = 50) {
  const q = query(
    collection(db, 'Payments'),
    where('userId', '==', clientEmail),
    where('paymentStatus', '==', 'paid'),
    orderBy('paidAt', 'desc')
  );
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// Add a new due document
export async function addClientDue(data) {
  // expected fields validated in screen
  return addDoc(collection(db, 'Payments'), data);
}

// Mark a Payment as Paid / Verified
export async function markPaymentPaid(paymentId, { paidAmount, paymentMethod, paidAt, status = 'verified' }) {
  const ref = doc(db, 'Payments', paymentId);
  await updateDoc(ref, {
    paidAmount,
    paidAt,
    paymentMethod,
    paymentStatus: 'paid',
    status,
    updatedAt: paidAt || new Date().toISOString(),
  });
}

// Delete a payment (usually a due)
export async function deletePayment(paymentId) {
  return deleteDoc(doc(db, 'Payments', paymentId));
}
