// utils/isAdmin.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { OfficeEmailOne /*, OfficeEmailTwo, ...*/ } from '../components/constants'; // adjust path if needed

// Normalize emails for safe comparison
const normalize = (v) => (v || '').trim().toLowerCase();

// Put all admin emails here (extensible)
const ADMIN_EMAILS = [OfficeEmailOne /*, OfficeEmailTwo*/]
  .filter(Boolean)
  .map(normalize);

/**
 * isAdmin(email?)
 * - If `email` is provided, checks that.
 * - Else tries Firebase currentUser email.
 * - Else falls back to AsyncStorage 'email'.
 * Returns: Promise<boolean>
 */
export default async function isAdmin(email) {
  try {
    const authEmail = getAuth()?.currentUser?.email;
    const storedEmail = await AsyncStorage.getItem('email');

    const toCheck = email ?? authEmail ?? storedEmail;
    return ADMIN_EMAILS.includes(normalize(toCheck));
  } catch {
    return false;
  }
}

/** Optional: pure synchronous check if you already have the email string */
export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(normalize(email));
}
