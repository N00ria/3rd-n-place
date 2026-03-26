import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // 1. Create the Auth Account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Set a default display name (e.g., Johnny)
        await updateProfile(user, {
          displayName: email.split('@')[0], // Use part of email as temp name
        });

        // 3. Create the Firestore Document
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: email.split('@')[0],
          bio: "Community Member",
          createdAt: serverTimestamp(),
          photoURL: "https://ui-avatars.com/api/?name=" + email.split('@')[0] + "&background=00274C&color=FFCB05"
        });

      } else {
        // Regular Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Success! The root _layout.tsx will automatically redirect 
      // because the 'user' state changed.
    } catch (error: any) {
      console.error(error);
      Alert.alert("Auth Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* LOGO SECTION */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>3rd</Text>
          </View>
          <Text style={styles.title}>3rd 'n Place</Text>
          <Text style={styles.subtitle}>Find your perfect third place</Text>
        </View>

        {/* INPUTS */}
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFCB05" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsRegistering(!isRegistering)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isRegistering 
                ? "Already have an account? Sign In" 
                : "New here? Create an account"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flex: 1, justifyContent: 'center', padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#00274C', // Michigan Blue
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15
  },
  logoText: { color: '#FFCB05', fontSize: 24, fontWeight: '900' }, // Michigan Maize
  title: { fontSize: 28, fontWeight: 'bold', color: '#00274C' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#F0F2F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16
  },
  mainButton: {
    backgroundColor: '#00274C',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: { color: '#FFCB05', fontSize: 18, fontWeight: 'bold' },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#00274C', fontWeight: '600' }
});