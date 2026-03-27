import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, accessibility: AccessibilityScores) => void;
}

export interface AccessibilityScores {
  lightingLevel?: number;
  noiseLevel?: number;
  physicalAccess?: number;
  sensory?: number;
}

const ACCESSIBILITY_FIELDS = [
  { key: 'lightingLevel', label: 'Lighting', icon: 'sunny-outline' },
  { key: 'noiseLevel', label: 'Noise Level', icon: 'mic-outline' },
  { key: 'physicalAccess', label: 'Physical Access', icon: 'body-outline' },
  { key: 'sensory', label: 'Sensory', icon: 'eye-outline' },
] as const;

export default function ReviewModal({ isVisible, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [accessibility, setAccessibility] = useState<AccessibilityScores>({});

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment, accessibility);
    // Reset
    setRating(0);
    setComment('');
    setAccessibility({});
  };

  const setScore = (key: keyof AccessibilityScores, value: number) => {
    setAccessibility(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leave a Review</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* OVERALL STAR RATING */}
          <Text style={styles.sectionTitle}>Overall Rating <Text style={styles.required}>*</Text></Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Ionicons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={i <= rating ? '#FFD700' : '#DDD'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* COMMENT */}
          <Text style={styles.sectionTitle}>Comment <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="What made this space great or not so great?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          {/* ACCESSIBILITY SCORES */}
          <Text style={styles.sectionTitle}>
            Accessibility Scores <Text style={styles.optional}>(optional)</Text>
          </Text>
          <Text style={styles.subtitle}>Only rate what's relevant to your experience.</Text>

          {ACCESSIBILITY_FIELDS.map(({ key, label, icon }) => {
            const current = accessibility[key];
            return (
              <View key={key} style={styles.accessRow}>
                <View style={styles.accessLabel}>
                  <Ionicons name={icon as any} size={16} color="#555" />
                  <Text style={styles.accessLabelText}>{label}</Text>
                  {current && (
                    <TouchableOpacity onPress={() => setScore(key, 0)}>
                      <Text style={styles.clearScore}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.segmentRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.segment, { backgroundColor: i <= (current || 0) ? '#2D9B57' : '#E8E8E8' }]}
                      onPress={() => setScore(key, i)}
                    />
                  ))}
                </View>
                {current ? (
                  <Text style={styles.scoreHint}>
                    {current >= 4 ? 'Excellent' : current >= 3 ? 'Good' : 'Poor'}
                  </Text>
                ) : (
                  <Text style={styles.scoreHint}>Tap to rate</Text>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={styles.submitText}>Submit Review</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  content: { padding: 24, paddingBottom: 60 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, marginTop: 24 },
  required: { color: '#FF4B4B' },
  optional: { fontSize: 13, fontWeight: '400', color: '#999' },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 16, marginTop: -8 },
  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  textInput: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 14, color: '#333', height: 100, textAlignVertical: 'top' },
  accessRow: { marginBottom: 20 },
  accessLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  accessLabelText: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  clearScore: { fontSize: 12, color: '#FF4B4B', fontWeight: '600' },
  segmentRow: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 10, borderRadius: 5 },
  scoreHint: { fontSize: 12, color: '#888', marginTop: 6 },
  submitBtn: { backgroundColor: '#2D60FF', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 32 },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});