// services/announcements.service.js
import {
  getFirestore, collection, query, where, orderBy, limit, getDocs,
} from 'firebase/firestore';

// Shape each announcement for easy rendering in your card
function shape(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    text: String(data.text || data.title || '').trim(), // UI uses a single line of text
    // if you later need it:
    publishedAt: data.publishedAt || data.createdAt || null,
    audience: data.audience || 'all',
  };
}

/**
 * Fetch the latest N announcements (default 2).
 * Expects docs to have: text (string), publishedAt (Timestamp) or createdAt.
 * Optional: active:boolean for visibility control.
 */
export async function loadLatestAnnouncements({ n = 2, onlyActive = true } = {}) {
  const db = getFirestore();

  // Primary query: active + publishedAt desc
  let q = query(
    collection(db, 'announcements'),
    orderBy('createdAt', 'desc'),
    limit(n)
  );

  try {
    const snap = await getDocs(q);
    const items = snap.docs.map(shape);
    console.log('Fetching announcements:', items);
    return items;
  } catch (err) {
    // Fallback if publishedAt is missing / no index: sort by createdAt
    const q2 = query(
      collection(db, 'announcements'),
      orderBy('createdAt', 'desc'),
      limit(n)
    );
    const snap2 = await getDocs(q2);
    return snap2.docs.map(shape);
  }
}
