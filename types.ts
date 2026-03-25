// types.ts

export interface AccessibilityFeatures {
  lightingLevel: number; // 1-5
  noiseLevel: number;    // 1-5
  physicalAccess: number; // 1-5
  sensory: number;       // 1-5
}

export interface Feedback {
  id?: string;
  comment: string;
  rating: number;
  timestamp: any; // Firestore Timestamp
  userId: string;
}

export interface Space {
  id: string;
  name: string;
  type: 'Library' | 'Cafe' | 'Park' | 'Office' | 'Gym' | 'Coworking Space'; // Add your types here
  address: string;
  averageRating: number;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: any;
  modifiedAt: any;
}