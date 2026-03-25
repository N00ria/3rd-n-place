import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewModal({ isVisible, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleLevelSubmit = () => {
    if (rating === 0) return alert("Please select a rating!");
    onSubmit(rating, comment);
    setRating(0); // Reset for next time
    setComment('');
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalContent}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Share Your Experience</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>How would you rate the accessibility?</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color={star <= rating ? "#FFB800" : "#CCC"} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Any specific notes (lighting, noise, etc)?</Text>
          <TextInput
            style={styles.input}
            placeholder="Write your review here..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleLevelSubmit}>
            <Text style={styles.submitText}>Submit Review</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: 'white', 
    borderTopLeftRadius: 25, 
    borderTopRightRadius: 25, 
    padding: 25, 
    paddingBottom: 40 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#666', marginBottom: 10, marginTop: 10 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15 },
  input: { 
    backgroundColor: '#F5F5F5', 
    borderRadius: 12, 
    padding: 15, 
    height: 100, 
    textAlignVertical: 'top',
    fontSize: 16 
  },
  submitButton: { 
    backgroundColor: '#2D60FF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 20 
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});