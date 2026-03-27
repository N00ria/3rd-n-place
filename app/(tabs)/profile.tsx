import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  ScrollView, SafeAreaView, ActivityIndicator, Alert, TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

// Firebase Imports
import { auth, db } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Draft states for editing
  const [editName, setEditName] = useState('');
  const [editUni, setEditUni] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setEditName(data.displayName || '');
          setEditUni(data.bio || '');
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    setLoading(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1, // High compression for Firestore Base64 storage
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const base64Image = `data:image/jpeg;base64,${base64}`;

      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, { photoURL: base64Image });

      setUserData({ ...userData, photoURL: base64Image });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not update photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, {
        displayName: editName,
        university: editUni
      });

      setUserData({ ...userData, displayName: editName, bio: editUni });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated!");
    } catch (e) {
      Alert.alert("Error", "Failed to save changes.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to head out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => signOut(auth) }
    ]);
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00274C" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: userData?.photoURL || 'https://i.pravatar.cc/150?u=temp' }} 
                style={[styles.avatar, uploading && { opacity: 0.5 }]} 
              />
              <View style={styles.cameraIconBadge}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.editFields}>
              <TextInput 
                style={styles.input} 
                value={editName} 
                onChangeText={setEditName} 
                placeholder="Display Name"
                autoFocus
              />
              <TextInput 
                style={styles.input} 
                value={editUni} 
                onChangeText={setEditUni} 
                placeholder="Bio"
              />
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{userData?.displayName || 'User'}</Text>
              <Text style={styles.userBio}>{userData?.bio || 'No bio added yet'}</Text>
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.editButton, isEditing && styles.saveButton]} 
            onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          >
            <Text style={[styles.editButtonText, isEditing && styles.saveButtonText]}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelLink}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <ProfileMenuOption 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => Alert.alert("Coming Soon", "Notification preferences are in development!")}
          />
          
          <ProfileMenuOption 
            icon="log-out-outline" 
            label="Sign Out" 
            color="#d32f2f" 
            onPress={handleSignOut} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// HELPER COMPONENT
function ProfileMenuOption({ icon, label, color = "#333", onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    alignItems: 'center', 
    paddingVertical: 40, 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#00274C' },
  cameraIconBadge: { 
    position: 'absolute', bottom: 5, right: 5, backgroundColor: '#00274C', 
    borderRadius: 15, padding: 6, borderWidth: 2, borderColor: '#FFF' 
  },
  userName: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginTop: 15 },
  userBio: { fontSize: 15, color: '#777', marginTop: 4 },
  
  // Edit Mode Styles
  editFields: { width: '80%', marginTop: 15 },
  input: {
    backgroundColor: '#F0F2F5', padding: 12, borderRadius: 10, marginBottom: 10,
    fontSize: 16, textAlign: 'center', color: '#00274C', fontWeight: '500'
  },
  editButton: { marginTop: 20, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, backgroundColor: '#F0F4FF' },
  editButtonText: { color: '#00274C', fontWeight: 'bold', fontSize: 16 },
  saveButton: { backgroundColor: '#00274C' },
  saveButtonText: { color: '#FFCB05' },
  cancelLink: { marginTop: 15 },
  cancelText: { color: '#777', fontWeight: '500' },

  section: { padding: 25, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1a1a1a' },
  menuRow: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#FFF', padding: 18, borderRadius: 16, marginBottom: 12 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16, fontWeight: '500' },
});