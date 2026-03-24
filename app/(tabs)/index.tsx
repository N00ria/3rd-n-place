import React from 'react';
import { StyleSheet, Button, View, Text, Alert } from 'react-native';
// Note: If firebaseConfig.js is in your root, and this file is in app/(tabs)/
// then ../../firebaseConfig is the correct path.
import { db } from '../../firebaseConfig'; 
import { collection, addDoc } from "firebase/firestore"; 

export default function HomeScreen() {

  const testFirebase = async () => {
    try {
      console.log("Attempting to write to Firebase...");
      const docRef = await addDoc(collection(db, "testCollection"), {
        message: "Hello from 3rd-n-place!",
        timestamp: new Date().toISOString()
      });
      console.log("Document written with ID: ", docRef.id);
      Alert.alert("Success!", "Document written with ID: " + docRef.id);
    } catch (e: any) {
      console.error("Firebase Error: ", e);
      Alert.alert("Error", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to 3rd-n-Place</Text>
      <View style={styles.buttonContainer}>
        <Button title="Test Firebase Connection" onPress={testFirebase} color="#007AFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Pure white background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
  }
});