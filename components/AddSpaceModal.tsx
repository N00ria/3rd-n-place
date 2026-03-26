import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Modal, View, Text, TextInput, StyleSheet, 
  TouchableOpacity, ScrollView, SafeAreaView, Image, ActivityIndicator, Alert, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Firebase Imports
import { db, storage } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ACCESSIBILITY_TAGS = [
  { id: 'quiet', label: 'Quiet Zone', icon: 'volume-mute-outline' },
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: 'body-outline' },
  { id: 'lighting', label: 'Dim Lighting', icon: 'sunny-outline' },
  { id: 'outlets', label: 'Power Outlets', icon: 'battery-charging-outline' },
  { id: 'gender', label: 'Gender Neutral Restrooms', icon: 'transgender-outline' },
  { id: 'sensory', label: 'Sensory Friendly', icon: 'eye-outline' },
];

interface AddSpaceModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AddSpaceModal({ isVisible, onClose }: AddSpaceModalProps) {
  // --- STATE ---
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    website: '',
    description: ''
  });

  // --- LOGIC: TOGGLE TAGS ---
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // --- LOGIC: PICK IMAGE ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need photo gallery access to upload a cover image.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  
  // --- LOGIC: SUBMIT TO FIREBASE ---
  const handleCreateSpace = async () => {
      console.log("Create button pressed");
    if (!formData.name || !image || !formData.category) {
      Alert.alert("Required Fields", "Please provide at least a name, category, and a photo.");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = '';

      // 1. Upload to Firebase Storage
      if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      finalImageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

      // 2. Add Document to Firestore
      const newSpaceRef = doc(collection(db, 'spaces'));

      // Save the doc
      await setDoc(newSpaceRef, {
        ...formData,
        tags: selectedTags,
        imageUrl: finalImageUrl,
        createdAt: serverTimestamp(),
        latitude: 42.2781,
        longitude: -83.7382,
        rating: 5.0,
      });

      setLoading(false);
      Alert.alert("Success!", "Your third space has been added.");
      
      // Reset Form
      setImage(null);
      setSelectedTags([]);
      setFormData({ name: '', category: '', phone: '', website: '', description: '' });
      onClose();

    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert("Upload Error", "There was an issue saving your space. Check your Firebase rules.");
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
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
                <Ionicons name="cloud-upload-outline" size={44} color="#2D60FF" />
                <Text style={styles.uploadHint}>Tap to select a photo</Text>
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
            placeholder="Category (e.g. Cafe, Library)" 
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
          
          <Text style={styles.label}>Accessibility Tags</Text>
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
                    size={16} 
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