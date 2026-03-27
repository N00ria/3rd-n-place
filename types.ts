export interface AccessibilityFeatures {
  lightingLevel: number;  // 1-5
  noiseLevel: number;     // 1-5
  physicalAccess: number; // 1-5
  sensory: number;        // 1-5
}

export interface Feedback {
  id?: string;
  comment: string;
  rating: number;
  createdAt: any;         // was 'timestamp' — now matches what the form saves
  userId: string;
  authorName: string;     // added — saved by handleAddReview
}

export interface Space {
  id: string;
  name: string;
  category: string;       // was rigid union type 'type' — form uses free text
  phone: string;
  website: string;
  description: string;
  tags: string[];         // array of tag ids
  imageUrl: string;
  rating: number;
  reviewCount: number;
  createdBy: string;      // user uid
  authorName: string;
  createdAt: any;
  hours?: string;
}