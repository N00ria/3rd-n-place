import React, { useState } from 'react';
import { 
  Modal, View, Text, TextInput, StyleSheet, 
  TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Firebase Imports
import { db, storage, auth } from '../firebaseConfig'; // Added auth
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { ACCESSIBILITY_TAGS } from '@/constants/tags';

interface AddSpaceModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AddSpaceModal({ isVisible, onClose }: AddSpaceModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category: '',
    phone: '',
    website: '',
    description: '',
    hours: ''
  });

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
        if (prev.includes(tagId)) {
        // Remove it if it exists
        return prev.filter((id) => id !== tagId);
        } else {
        // Add it if it doesn't
        return [...prev, tagId];
        }
    });
};

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to upload a photo.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.6, // Compressed for faster uploads
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateSpace = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Auth Error", "You must be signed in to add a space.");
      return;
    }

    if (!formData.name || !image || !formData.category) {
      Alert.alert("Missing Info", "Please provide a name, category, and a photo.");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = '';

      // 1. Upload Image to Firebase Storage (The Professional Way)
      const response = await fetch(image);
      const blob = await response.blob();
      const storageRef = ref(storage, `spaces/${Date.now()}-${user.uid}.jpg`);
      
      const uploadResult = await uploadBytes(storageRef, blob);
      finalImageUrl = await getDownloadURL(uploadResult.ref);

      // 2. Add Document to Firestore
      await addDoc(collection(db, 'spaces'), {
        name: formData.name,
        location: formData.address,
        category: formData.category,
        phone: formData.phone,
        website: formData.website,
        description: formData.description,
        tags: selectedTags,
        imageUrl: finalImageUrl,
        createdBy: user.uid,
        authorName: user.displayName || 'Anonymous User',
        createdAt: serverTimestamp(),
        rating: 5.0,
        reviewCount: 0,
        hours: formData.hours,
      });

      setLoading(false);
      Alert.alert("Success!", "Johnny, your new space is live!");
      
      // Cleanup
      setImage(null);
      setSelectedTags([]);
      setFormData({ name: '', address: '', category: '', phone: '', website: '', description: '' });
      onClose();

    } catch (error) {
      console.error("Submission Error:", error);
      setLoading(false);
      Alert.alert("Error", "Could not save space. Check your internet and Firebase rules.");
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      {/* ... (Keep your existing Modal/Header/Input JSX here - it's perfect) ... */}
      {/* Ensure the submit button calls handleCreateSpace */}
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="close-outline" size={32} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add a Third Space!</Text>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Upload Cover Image</Text>
          
          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={styles.placeholderContent}>
                <Ionicons name="image-outline" size={44} color="#2D60FF" />
                <Text style={styles.uploadHint}>Add a photo of the space</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput 
            style={styles.input} 
            placeholder="Name of Location" 
            placeholderTextColor="#999"
            value={formData.name}
            onChangeText={(v) => setFormData({...formData, name: v})}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Address" 
            placeholderTextColor="#999"
            value={formData.address}
            onChangeText={(v) => setFormData({...formData, address: v})}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Category (e.g. Park, Cafe, Coworking Space)" 
            placeholderTextColor="#999"
            value={formData.category}
            onChangeText={(v) => setFormData({...formData, category: v})}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Phone Number" 
            keyboardType="phone-pad" 
            placeholderTextColor="#999"
            value={formData.phone}
            onChangeText={(v) => setFormData({...formData, phone: v})}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Website URL" 
            keyboardType="url" 
            placeholderTextColor="#999"
            value={formData.website}
            onChangeText={(v) => setFormData({...formData, website: v})}
          />
          <TextInput
            style={styles.input}
            placeholder='Hours (e.g. "Mon-Fri: 6am-9pm)'
            placeholderTextColor="#999"
            value={formData.hours}
            onChangeText={(v) => setFormData({...formData, hours: v})}
          />
          
          <Text style={styles.label}>Accessibility & Features</Text>
          <View style={styles.tagContainer}>
            {ACCESSIBILITY_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity 
                  key={tag.id} 
                  style={[styles.tagChip, isSelected && styles.tagChipSelected]} 
                  onPress={() => toggleTag(tag.id)}
                >
                  <Ionicons 
                    name={tag.icon as any} 
                    size={14} 
                    color={isSelected ? 'white' : '#666'} 
                  />
                  <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Description (What makes this space great?)" 
            placeholderTextColor="#999"
            multiline 
            numberOfLines={4} 
            value={formData.description}
            onChangeText={(v) => setFormData({...formData, description: v})}
          />

          <TouchableOpacity 
            style={[styles.submitButton, loading && { opacity: 0.6 }]} 
            onPress={handleCreateSpace}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Your Space</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    backgroundColor: '#2D60FF', 
    height: 160, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 20 : 0 
  },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  form: { padding: 25, paddingBottom: 60 },
  label: { fontSize: 16, fontWeight: '700', marginBottom: 15, color: '#1a1a1a' },
  uploadBox: {
    height: 180,
    borderWidth: 2,
    borderColor: '#2D60FF',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    overflow: 'hidden',
    backgroundColor: '#F8FAFF'
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderContent: { alignItems: 'center' },
  uploadHint: { color: '#2D60FF', marginTop: 10, fontWeight: '600' },
  input: {
    backgroundColor: '#F0F2F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tagChipSelected: {
    backgroundColor: '#2D60FF',
    borderColor: '#2D60FF',
  },
  tagText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tagTextSelected: { color: 'white' },
  submitButton: { 
    backgroundColor: '#2D60FF', 
    padding: 20, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#2D60FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4
  },
  submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});