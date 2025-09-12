// services/payments.service.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getFirestore, collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';

// If you prefer no dependency, comment these two lines and see the vanilla fallback below.
import { startOfMonth, endOfMonth } from 'date-fns';

const now = new Date();
const monthStart = startOfMonth(now);
const monthEnd = endOfMonth(now);

// ---- Utilities ----
function tsToDate(v) {
    // Firestore Timestamp or ISO/string/number → Date
    if (v?.toDate) return v.toDate();
    if (typeof v === 'number') return new Date(v);
    return new Date(v);
}

function fmtInr(n) {
    return `₹ ${Number(n || 0).toLocaleString('en-IN')}`;
}

function fmtDateTimeForUI(d) {
    // 06 Aug 2025 14:35 (en-IN)
    const date = tsToDate(d);
    const dPart = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const tPart = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `${dPart} ${tPart}`;
}

function fmtDateForUI(d) {
    // 06 Aug 2025 (en-IN)
    const date = tsToDate(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Loads dashboard-relevant payment data for the signed-in user.
 * Returns:
 * {
 *   totalDue: number,
 *   oldDues:  Array<{id, label, dueDate, amount}>,
 *   recentTransactions: Array<{id, label, amount, ts}>,
 *   thisMonthPayments: number
 * }
 */
export async function loadHomePaymentsSnapshot() {
    const email = await AsyncStorage.getItem('email');
    if (!email) throw new Error('No email found in storage');

    const db = getFirestore();

    // ---------- All DUE items for total sum ----------
    const duesQ = query(
        collection(db, 'Payments'),
        where('userId', '==', email),
        where('paymentStatus', '==', 'due' || 'Overdue'),
        orderBy('dueDate', 'asc') // earliest due first
    );
    const duesSnap = await getDocs(duesQ);
    const allDuesRaw = duesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    duesSnap.docs.map(d => (console.log(d.data())));

    const totalDue = allDuesRaw.reduce((sum, row) => {
        const amt = Number(row.amount || 0);
        return sum + (Number.isFinite(amt) ? amt : 0);
    }, 0);

    // ---------- This Month Payments (paid) ----------
    const monthQ = query(
        collection(db, 'Payments'),
        where('userId', '==', email),
        where('paymentStatus', '==', 'paid'),
        where('paidAt', '>=', monthStart),
        where('paidAt', '<=', monthEnd)
    );
    const monthSnap = await getDocs(monthQ);
    const monthPayments = monthSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const thisMonthPayments = monthPayments.reduce((sum, row) => {
        const amt = Number(row.amount || 0);
        return sum + (Number.isFinite(amt) ? amt : 0);
    }, 0);

    // ---------- Old (past) dues: pick the two most recent past-due items ----------
    const nowLocal = new Date();
    const pastDuesDesc = allDuesRaw
        .filter(d => tsToDate(d.dueDate) < nowLocal)
        .sort((a, b) => tsToDate(b.dueDate) - tsToDate(a.dueDate)); // newest past first

    // Take 2 newest past dues, then render in chronological order for UI (older first)
    const oldDues = pastDuesDesc
        .slice(0, 2)
        .sort((a, b) => tsToDate(a.dueDate) - tsToDate(b.dueDate))
        .map(d => ({
            id: d.id,
            label: d.label || d.description || 'Due Item',
            dueDate: fmtDateForUI(d.dueDate),          // <-- UI date string
            amount: Number(d.amount || 0),             // <-- numeric; your UI formats ₹ itself
        }));

    // ---------- Recent Transactions: last 2 PAID (latest first) ----------
    const txQ = query(
        collection(db, 'Payments'),
        where('userId', '==', email),
        where('paymentStatus', '==', 'paid'),
        orderBy('paidAt', 'desc'),
        limit(2)
    );
    const txSnap = await getDocs(txQ);
    const txRaw = txSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Guard sorting if any doc misses paidAt
    txRaw.sort((a, b) => {
        const ad = tsToDate(a.paidAt || a.updatedAt || a.createdAt || 0);
        const bd = tsToDate(b.paidAt || b.updatedAt || b.createdAt || 0);
        return bd - ad;
    });

    const recentTransactions = txRaw.map(t => {
        const when = t.paidAt || t.updatedAt || t.createdAt || new Date();
        return {
            id: t.id,
            label: t.label || t.description || 'Payment',
            amount: fmtInr(t.amount),          // <-- preformatted "₹ 1,23,456"
            ts: fmtDateTimeForUI(when),        // <-- "06 Aug 2025 14:35"
        };
    });

    return { totalDue, oldDues, recentTransactions, thisMonthPayments };
}

/* ------------- Vanilla month range (if you remove date-fns) -------------
const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
------------------------------------------------------------------------- */
