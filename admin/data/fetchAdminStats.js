// src/admin/data/fetchAdminStats.js
import {
  collection,
  getDocs,
  query,
  orderBy,
  startAt,
  endAt,
} from 'firebase/firestore';

/** Robust parsers (handle number, "₹ 90,000", undefined, etc.) */
const toNumber = (v) => {
  if (typeof v === 'number') return v;
  if (v == null) return 0;
  const s = String(v).replace(/[^\d.-]/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};
const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (v?.toDate) return v.toDate(); // Firestore Timestamp
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

/**
 * Reads stats from:
 *  - users:       count clients (userType !== 'admin', missing => treated as client)
 *  - Payments:    dues (outstanding > 0), and this month's paid totals
 *
 * Returns:
 * {
 *   clientsCount,
 *   duesCount,
 *   duesAmount,
 *   monthPaidCount,
 *   monthPaidAmount
 * }
 */
export async function fetchAdminStats(db) {
  // ----- Clients count ------------------------------------------------------
  let clientsCount = 0;
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.forEach((doc) => {
      const u = doc.data() || {};
      // treat missing as client; exclude admins
      if ((u.userType || '').toLowerCase() !== 'admin') {
        clientsCount += 1;
      }
    });
  } catch (e) {
    console.warn('fetchAdminStats: users read failed', e);
  }

  // ----- Dues + This month's paid totals -----------------------------------
  let duesCount = 0;
  let duesAmount = 0;
  let monthPaidCount = 0;
  let monthPaidAmount = 0;

  try {
    // We’ll read all Payments once (you can index + filter later if needed).
    const paySnap = await getDocs(collection(db, 'Payments'));

    // Month window (local time)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);

    paySnap.forEach((doc) => {
      const p = doc.data() || {};

      const amount = toNumber(p.amountNumber ?? p.amount);
      const paid = toNumber(p.paidAmountNumber ?? p.paidAmount);

      // Compute outstanding safely
      const outstanding = Math.max(0, amount - paid);

      // DUE if outstanding > 0 OR explicit status/paymentStatus says due/partial/pending
      const status = String(p.status || '').toLowerCase();
      const pstatus = String(p.paymentStatus || '').toLowerCase();
      const isDueExplicit =
        pstatus.includes('due') ||
        pstatus.includes('partial') ||
        status.includes('due') ||
        status.includes('pending');

      if (outstanding > 0 || isDueExplicit) {
        duesCount += 1;
        duesAmount += outstanding;
      }

      // This month's PAID:
      // consider a doc paid if status/paymentStatus says paid/settled OR paid >= amount
      const isPaidExplicit =
        status.includes('paid') ||
        status.includes('settled') ||
        pstatus.includes('paid') ||
        pstatus.includes('settled') ||
        paid >= amount;

      // choose a date for the paid time (paidAt || createdAt || updatedAt)
      const paidDate =
        toDate(p.paidAt) ||
        toDate(p.createdAt) ||
        toDate(p.updatedAt) ||
        null;

      if (isPaidExplicit && paidDate && paidDate >= monthStart && paidDate < nextMonth) {
        monthPaidCount += 1;
        monthPaidAmount += paid || amount; // prefer actual paid, fallback to amount
      }
    });
  } catch (e) {
    console.warn('fetchAdminStats: Payments read failed', e);
  }

  return {
    clientsCount,
    duesCount,
    duesAmount,
    monthPaidCount,
    monthPaidAmount,
  };
}
