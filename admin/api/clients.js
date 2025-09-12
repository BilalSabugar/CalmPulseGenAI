// admin/api/clients.js
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import db from '../../firebase';

/**
 * Live list of non-admin users from Firestore "users" collection.
 * Filters userType !== 'admin' on the client for compatibility.
 */
export function listenClients(cb) {
    const col = query(collection(db, 'users'), where('userType', '!=', 'admin' && 'noClient'));
    return onSnapshot(col, (snap) => {
        const list = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((u) => (u?.userType || '').toLowerCase() !== 'admin');
        cb(list);
    });
}
