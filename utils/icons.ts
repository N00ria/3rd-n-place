// utils/icons.ts
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export const getTagIcon = (tagName: string) => {
  switch (tagName.toLowerCase()) {
    case 'quiet': 
      return { icon: 'volume-off', type: 'ionicon' as const };
    case 'wheelchair accessible': 
      return { icon: 'wheelchair-accessibility', type: 'material' as const };
    case 'neurodivergent friendly': 
      return { icon: 'brain', type: 'material' as const };
    case 'study friendly': 
      return { icon: 'book-outline', type: 'ionicon' as const };
    case 'low-sensory':
      return { icon: 'eye-off-outline', type: 'ionicon' as const };
    default: 
      return { icon: 'star-outline', type: 'ionicon' as const };
  }
};