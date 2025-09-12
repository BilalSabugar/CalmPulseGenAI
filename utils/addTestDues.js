import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import db from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const addTestDue = async () => {
  try {
    const email = (await AsyncStorage.getItem('email'))?.trim();
    if (!email) throw new Error('No email found in AsyncStorage');

    await addDoc(collection(db, 'Payments'), {
      label: 'Test Fee - Sample Client',
      amount: 12000,
      status: 'Pending',
      dueDate: '2025-08-28',
      createdAt: serverTimestamp(),
      userId: email
    });

    console.log('✅ Test due added!');
  } catch (err) {
    console.error('❌ Error adding test due:', err);
  }
};
