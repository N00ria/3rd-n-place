export const getTagIcon = (tagId: string) => {
  switch (tagId.toLowerCase()) {
    case 'quiet': 
      return { icon: 'volume-mute-outline', type: 'ionicon' as const };
    case 'ambient': 
      return { icon: 'musical-notes-outline', type: 'ionicon' as const };
    case 'step-free': 
      return { icon: 'wheelchair-accessibility', type: 'material' as const };
    case 'natural': 
      return { icon: 'sunny-outline', type: 'ionicon' as const };
    case 'dim':
        return {icon: 'moon-outline', type: 'ionicon' as const};
    case 'elevator':
        return {icon: 'swap-vertical-outline', type: 'ionicon' as const};
    case 'power':
        return {icon: 'battery-charging-outline', type: 'ionicon' as const};
    case 'gender-neutral':
        return {icon: 'transgender-outline', type: 'ionicon' as const};
    case 'service-animal':
        return {icon: 'paw-outline', type: 'ionicon' as const};
    case 'no-purchase':
        return {icon: 'wallet-outline', type: 'ionicon' as const};
    case 'transit':
        return {icon: 'bus-outline', type: 'ionicon' as const};
    case 'wifi':
        return {icon: 'wifi-outline', type: 'ionicon' as const};
    case 'late':
        return {icon: 'time-outline', type: 'ionicon' as const};
    case 'outdoors':
        return {icon: 'leaf-outline', type: 'ionicon' as const};
    default: 
      return { icon: 'star-outline', type: 'ionicon' as const };
  }
};