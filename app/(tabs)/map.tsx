 import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db } from '../../firebaseConfig';

export default function MapScreen() {
  const [spaces, setSpaces] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'spaces'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpaces(data);
    });
    return unsub;
  }, []);

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 42.2808,      // Change to your city
        longitude: -83.7430,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {spaces.map((space) =>
        space.latitude && space.longitude ? (
          <Marker
            key={space.id}
            coordinate={{ latitude: space.latitude, longitude: space.longitude }}
            title={space.name}
            description={space.address || ''}
          />
        ) : null
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});