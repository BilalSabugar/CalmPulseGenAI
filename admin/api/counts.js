// admin/api/counts.js
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import db from '../../firebase';

// tolerant date parser
function toDate(v) {
  if (!v) return null;
  if (typeof v?.toDate === 'function') return v.toDate();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// --- Clients ---
export function listenClientsCount(cb) {
  return onSnapshot(query(collection(db, 'users'), where("userType", "!=", "noClient" && "admin")), (snap) => {
    const n = snap.docs.filter((d) => (d.data()?.userType || '').toLowerCase() !== 'admin').length;
    cb(n);
  });
}

// --- Dues summary ---
export function listenDuesSummary(cb) {
  return onSnapshot(collection(db, 'Payments'), where("paymentStatus", '==', "due"), (snap) => {
    const today = new Date();
    let totalCount = 0, totalAmount = 0;
    let pendingCount = 0, pendingAmount = 0;
    let overdueCount = 0, overdueAmount = 0;

    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    all.forEach((x) => {
      const amt = Number(x?.amount || 0);
      if (!Number.isNaN(amt)) {
        totalAmount += amt;
      }
      totalCount += 1;

      const status = (x?.paymentStatus || '').toLowerCase();
      if (status === 'due') {
        pendingCount += 1;
        pendingAmount += Number.isNaN(amt) ? 0 : amt;

        const due = toDate(x?.dueDate);
        if (due && due < today) {
          overdueCount += 1;
          overdueAmount += Number.isNaN(amt) ? 0 : amt;
        }
      }
    });

    // top 5 overdue (soonest due first)
    const topOverdue = all
      .filter((x) => (x?.status || '').toLowerCase() === 'pending' && toDate(x?.dueDate) && toDate(x?.dueDate) < today)
      .sort((a, b) => toDate(a.dueDate) - toDate(b.dueDate))
      .slice(0, 5);

    cb({ totalCount, totalAmount, pendingCount, pendingAmount, overdueCount, overdueAmount, topOverdue });
  });
}

// --- This month totals ---
export function listenMonthlyTransactions(cb) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return onSnapshot(collection(db, 'Payments'), where("paymentStatus", "==", "paid"), (snap) => {
    let count = 0, amount = 0;
    snap.docs.forEach((d) => {
      const x = d.data();
      const dt = toDate(x?.createdAt);
      if (dt && dt >= start) {
        count += 1;
        const val = Number(x?.amount || 0);
        if (!Number.isNaN(val)) amount += val;
      }
    });
    cb({ count, amount });
  }, () => cb({ count: 0, amount: 0 }));
}

// --- Recent transactions (this month, latest 8) ---
export function listenRecentTransactions(cb, limitN = 8) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  return onSnapshot(collection(db, 'Payments'), where("paymentStatus", "==", "paid"), (snap) => {
    const list = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((x) => {
        const dt = toDate(x?.createdAt);
        return dt && dt >= start;
      })
      .sort((a, b) => (toDate(b.createdAt) - toDate(a.createdAt)))
      .slice(0, limitN);
    cb(list);
  }, () => cb([]));
}
