import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function MapScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Map', headerShown: true }} />
      <View>
        <Text>Map Screen</Text>
      </View>
    </>
  );
}