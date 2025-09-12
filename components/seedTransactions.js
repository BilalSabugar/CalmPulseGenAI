// seedTransactions.js
import { writeBatch, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import db from '../firebase'; // adjust the import path if needed

// Simple INR formatter (robust across RN without Intl quirks)
const inr = (n) => `₹ ${Number(n).toLocaleString('en-IN')}`;

// 8-char friendly id
const rid = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
};

/**
 * Creates a few sample transactions under: /{email}/transactions/{id}
 * Each transaction has: id, label, amount (string), amountNumber, ts, type, utr?, invoiceUrl?, receiptUrl?
 * Safe to run multiple times—doc IDs are unique per run.
 */
export async function seedSampleTransactions() {
  const email = await AsyncStorage.getItem('email');
  if (!email) throw new Error('No user email in AsyncStorage');

  const now = moment();

  // Feel free to change URLs to your real files
  const samples = [
    {
      id: `TX${rid()}`,
      label: 'Online Payment – Aragon PEB',
      amountNumber: 197500,
      type: 'Payment',
      utr: 'HDFC3A2B9C7D',
      ts: now.clone().subtract(2, 'days').toISOString(),
      invoiceUrl: 'https://example.com/invoices/inv-ARAGON-1001.pdf',
      receiptUrl: 'https://example.com/receipts/rcpt-ARAGON-1001.pdf',
      email:'bilal.07.04.07@gmail.com'
    },
    {
      id: `TX${rid()}`,
      label: 'Refund – Rama PVC',
      amountNumber: -15000,
      type: 'Refund',
      utr: 'ICIC9Z8Y6X5W',
      ts: now.clone().subtract(4, 'days').toISOString(),
      invoiceUrl: null,
      receiptUrl: 'https://example.com/receipts/rcpt-RAMA-2099.pdf',
      email:'bilal.07.04.07@gmail.com'
    },
    {
      id: `TX${rid()}`,
      label: 'Cash Deposit – Office',
      amountNumber: 32000,
      type: 'Cash',
      utr: null,
      ts: now.clone().subtract(7, 'days').toISOString(),
      invoiceUrl: 'https://example.com/invoices/inv-CASH-7781.pdf',
      receiptUrl: 'https://example.com/receipts/rcpt-CASH-7781.pdf',
      email:'bilal.07.04.07@gmail.com'
    },
    {
      id: `TX${rid()}`,
      label: 'UPI Payment – GST Filing',
      amountNumber: 45000,
      type: 'UPI',
      utr: 'SBI1Q2W3E4R5T',
      ts: now.clone().subtract(10, 'hours').toISOString(),
      invoiceUrl: 'https://example.com/invoices/inv-GST-45000.pdf',
      receiptUrl: 'https://example.com/receipts/rcpt-GST-45000.pdf',
      email:'bilal.07.04.07@gmail.com'
    },
    {
      id: `TX${rid()}`,
      label: 'Online Payment – Mamta Agro',
      amountNumber: 90000,
      type: 'Payment',
      utr: 'AXIS7L6K5J4H',
      ts: now.clone().subtract(30, 'minutes').toISOString(),
      invoiceUrl: 'https://example.com/invoices/inv-MAMTA-90000.pdf',
      receiptUrl: 'https://example.com/receipts/rcpt-MAMTA-90000.pdf',
      email:'bilal.07.04.07@gmail.com'
    },
  ].map((t) => ({
    ...t,
    amount: inr(t.amountNumber),
    createdAt: t.ts, // alias if you also read createdAt
  }));

  const batch = writeBatch(db);
  for (const t of samples) {
    const ref = doc(db, 'transactions', t.id);
    batch.set(ref, t);
  }
  await batch.commit();

  return samples.length;
}
