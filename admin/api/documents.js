// admin/api/documents.js
import { addDoc, collection } from 'firebase/firestore';
import db from '../../firebase';

// Creates a new empty document under the user's collection (ownerEmail)
// Marks as created by admin so the client can't edit.
export async function createClientDocument(ownerEmail, title = 'New Document', description = '', actorEmail = 'admin') {
  const payload = {
    title,
    description,
    files: [],
    createdAt: new Date().toISOString(),
    uploadedBy: 'admin',           // important: blocks client edits in your viewer
    userId: ownerEmail,
    createdBy: actorEmail,
  };
  const res = await addDoc(collection(db, ownerEmail), payload);
  return res.id;
}
