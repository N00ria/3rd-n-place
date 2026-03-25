import { View } from 'react-native';

// This file exists just so Expo Router recognizes the tab.
// Our 'preventDefault' in _layout.tsx stops it from ever actually opening.
export default function AddPlaceholder() {
  return <View />;
}