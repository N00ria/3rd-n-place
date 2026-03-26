import { db, auth } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const syncUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  // If the user doesn't exist in the 'users' collection yet, create them
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || 'Johnny', // Fallback name
      photoURL: user.photoURL || 'https://i.pravatar.cc/150?u=johnny',
      email: user.email,
      createdAt: new Date(),
      contributions: 0
    });
    console.log("New user profile created for:", user.uid);
  }
};