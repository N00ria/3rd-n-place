import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from './firebaseConfig'
import { Space, AccessibilityFeatures } from './types'

// Get all spaces for discovery feed
export const getAllSpaces = async (): Promise<Space[]> => {
    const spacesCol = collection(db, 'spaces');
    const snapshot = await getDocs(spacesCol)

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Space[];
};

export const getSpaceAccessibility = async (spaceId: string) => {
  const docRef = doc(db, 'spaces', spaceId, 'accessibility_features', 'details');
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};

// database.ts helper
const getTagIcon = (tagName: string) => {
  switch (tagName.toLowerCase()) {
    case 'quiet': return { icon: 'volume-off', type: 'ionicon' };
    case 'wheelchair accessible': return { icon: 'wheelchair-accessibility', type: 'material' };
    case 'neurodivergent friendly': return { icon: 'brain', type: 'material' };
    case 'study friendly': return { icon: 'book-outline', type: 'ionicon' };
    default: return { icon: 'star-outline', type: 'ionicon' };
  }
};