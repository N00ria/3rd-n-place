import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Space, AccessibilityFeatures, Feedback } from '../../types';
import ReviewModal from '../../components/ReviewModal';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // States
  const [space, setSpace] = useState<Space | null>(null);
  const [access, setAccess] = useState<AccessibilityFeatures | null>(null);
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Fetch Data Logic
  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      try {
        const spaceSnap = await getDoc(doc(db, 'spaces', id));
        const accessSnap = await getDoc(doc(db, 'spaces', id, 'accessibility_features', 'details'));
        const feedbackSnap = await getDocs(collection(db, 'spaces', id, 'feedback'));
        
        const feedbackList = feedbackSnap.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as Feedback));

        if (spaceSnap.exists()) {
          setSpace({ id: spaceSnap.id, ...spaceSnap.data() } as Space);
          setAccess(accessSnap.exists() ? accessSnap.data() as AccessibilityFeatures : null);
          setReviews(feedbackList);
        }
      } catch (e) {
        console.error("Error loading space:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  // 2. Add Review Logic
  const handleAddReview = async (rating: number, comment: string) => {
    try {
      const feedbackRef = collection(db, 'spaces', id, 'feedback');
      await addDoc(feedbackRef, {
        rating,
        comment,
        userId: "Johnny",
        createdAt: serverTimestamp()
      });
      setModalVisible(false);
      Alert.alert("Success", "Review submitted! Thank you.");
    } catch (e) {
      console.error("Error adding review: ", e);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2D60FF" /></View>;
  if (!space) return <View style={styles.center}><Text>Space not found.</Text></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView bounces={false}>
        {/* HEADER IMAGE */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: space.imageUrl || 'https://via.placeholder.com/400' }} 
            style={styles.image} 
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* CONTENT CARD */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>{space.name}</Text>
          <Text style={styles.address}>{space.address}</Text>

          {/* ACCESSIBILITY BARS */}
          <Text style={styles.sectionTitle}>Accessibility Scores</Text>
          <View style={styles.scoresContainer}>
            <ScoreBar label="Lighting" value={access?.lightingLevel || 0} icon="sunny-outline" />
            <ScoreBar label="Noise" value={access?.noiseLevel || 0} icon="volume-medium-outline" />
            <ScoreBar label="Physical" value={access?.physicalAccess || 0} icon="body-outline" />
          </View>

          {/* REVIEWS SECTION */}
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.addLink}>+ Add Review</Text>
            </TouchableOpacity>
          </View>

          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <Text style={styles.reviewUser}>{rev.userId} • ⭐ {rev.rating}</Text>
                <Text style={styles.reviewComment}>"{rev.comment}"</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>

      <ReviewModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={handleAddReview}
      />
    </View>
  );
}

// Helper component for the bars
function ScoreBar({ label, value, icon }: { label: string; value: number; icon: any }) {
  return (
    <View style={styles.scoreRow}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={16} color="#666" />
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{value}/5</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${(value / 5) * 100}%` }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { width: '100%', height: 280, position: 'relative' },
  image: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  contentCard: { flex: 1, marginTop: -30, backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 5 },
  address: { fontSize: 14, color: '#777', marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
  scoresContainer: { marginBottom: 20 },
  scoreRow: { marginBottom: 15 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  scoreLabel: { marginLeft: 8, fontSize: 14, color: '#444', flex: 1 },
  scoreValue: { fontWeight: 'bold', color: '#2e7d32' },
  track: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4 },
  fill: { height: '100%', backgroundColor: '#2e7d32', borderRadius: 4 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  addLink: { color: '#2D60FF', fontWeight: 'bold' },
  reviewCard: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 10, marginBottom: 10 },
  reviewUser: { fontWeight: 'bold', color: '#333', marginBottom: 4 },
  reviewComment: { color: '#666', fontStyle: 'italic' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 10 }
});