import { getDocs, query, collection, where, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../firebase'; // your firebase config

export async function getDisplayName() {
  try {
    const email = await AsyncStorage.getItem('email');
    if (!email) {
      console.log('No email in storage');
      return null;
    }

    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      limit(1) // only need one result
    );

    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const userDoc = querySnap.docs[0].data();
      return userDoc.displayName ? userDoc.displayName : userDoc.company || null;
    } else {
      console.log('No user found');
      return null;
    }
  } catch (err) {
    console.error('Error fetching displayName:', err);
    return null;
  }
}
