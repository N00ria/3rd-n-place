import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, 
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../../firebaseConfig';
import { Space, AccessibilityFeatures, Feedback } from '../../types';
import ReviewModal from '../../components/ReviewModal';
import { ACCESSIBILITY_TAGS } from '@/constants/tags';
import { getTagIcon } from '../../utils/icons';

export default function SpaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [space, setSpace] = useState<Space | null>(null);
  const [access, setAccess] = useState<AccessibilityFeatures | null>(null);
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsubSpace = onSnapshot(doc(db, 'spaces', id), (snap) => {
      if (snap.exists()) setSpace({ id: snap.id, ...snap.data() } as Space);
      setLoading(false);
    }, (e) => { console.error(e); setLoading(false); });

    const unsubAccess = onSnapshot(
      doc(db, 'spaces', id, 'accessibility_features', 'details'),
      (snap) => setAccess(snap.exists() ? snap.data() as AccessibilityFeatures : null)
    );

    const unsubReviews = onSnapshot(
      collection(db, 'spaces', id, 'feedback'),
      (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
        list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setReviews(list);
      }
    );

    return () => { unsubSpace(); unsubAccess(); unsubReviews(); };
  }, [id]);

  const handleAddReview = async (rating: number, comment: string) => {
    const user = auth.currentUser;
    if (!user) { Alert.alert("Sign in required", "You must be signed in to leave a review."); return; }
    try {
      await addDoc(collection(db, 'spaces', id, 'feedback'), {
        rating, comment,
        userId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", "Could not submit review.");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2D60FF" /></View>;
  if (!space) return <View style={styles.center}><Text>Space not found.</Text></View>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* ── HERO with gradient overlay ── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: space.imageUrl || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.heroGradient}
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          {/* Category badge */}
          {space.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{space.category}</Text>
            </View>
          )}

          {/* Title block at bottom of hero */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{space.name}</Text>
            {space.address ? (
              <View style={styles.heroAddressRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroAddress}>{space.address}</Text>
              </View>
            ) : null}
            {avgRating && (
              <View style={styles.heroRatingRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.heroRating}>{avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── WHITE CONTENT CARD ── */}
        <View style={styles.contentCard}>

          {/* HOURS (placeholder — add to Space type when you have it) */}
              {space.website || space.phone || space.hours ? (
                <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact</Text>
                        {space.hours ? (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={15} color="#555" />
                  <Text style={styles.infoText}>{space.hours}</Text>
                </View>
              ) : null}
              {space.phone ? (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={15} color="#555" />
                  <Text style={styles.infoText}>{space.phone}</Text>
                </View>
              ) : null}
              {space.website ? (
                <View style={styles.infoRow}>
                  <Ionicons name="globe-outline" size={15} color="#555" />
                  <Text style={styles.infoText}>{space.website}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* TAGS */}
          {space.tags && space.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.chipRow}>
                {space.tags.map((tagId: string) => {
                  const tagDef = ACCESSIBILITY_TAGS.find(t => t.id === tagId);
                  const { icon, type } = getTagIcon(tagId);
                  return (
                    <View key={tagId} style={styles.chip}>
                      {type === 'ionicon'
                        ? <Ionicons name={icon} size={13} color="#333" />
                        : <MaterialCommunityIcons name={icon} size={13} color="#333" />
                      }
                      <Text style={styles.chipText}>{tagDef?.label || tagId}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ABOUT */}
          {space.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Space</Text>
              <Text style={styles.bodyText}>{space.description}</Text>
            </View>
          ) : null}

          {/* ACCESSIBILITY FEATURES */}
          {access && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accessibility Features</Text>
              <AccessibilityRow label="Lighting" value={access.lightingLevel || 0} icon="sunny-outline" color="#FFA940" />
              <AccessibilityRow label="Noise Level" value={access.noiseLevel || 0} icon="mic-outline" color="#2D60FF" />
              <AccessibilityRow label="Physical Access" value={access.physicalAccess || 0} icon="body-outline" color="#52C41A" />
              <AccessibilityRow label="Sensory" value={access.sensory || 0} icon="eye-outline" color="#9B59B6" />
            </View>
          )}

          {/* REVIEWS */}
          <View style={styles.section}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionTitle}>
                Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
              </Text>
              <TouchableOpacity style={styles.addReviewBtn} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={15} color="#2D60FF" />
                <Text style={styles.addReviewText}>Add Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 ? reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {(rev.authorName || 'A')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewAuthor}>{rev.authorName || 'Anonymous'}</Text>
                    <View style={styles.starsRow}>
                      {[1,2,3,4,5].map(i => (
                        <Ionicons key={i} name="star" size={12}
                          color={i <= rev.rating ? '#FFD700' : '#E0E0E0'} />
                      ))}
                    </View>
                  </View>
                </View>
                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
              </View>
            )) : (
              <View style={styles.emptyReviews}>
                <Ionicons name="chatbubble-outline" size={32} color="#DDD" />
                <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
              </View>
            )}
          </View>

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


// ── Segmented score bar matching the design ──
function AccessibilityRow({ label, value, icon, color }: { label: string; value: number; icon: any; color: string }) {
  const getLabel = (v: number) => {
    if (v >= 4) return { text: 'Excellent', bg: '#E6F9EE', fg: '#2D9B57' };
    if (v >= 3) return { text: 'Good', bg: '#FFF7E6', fg: '#D48806' };
    return { text: 'Poor', bg: '#FFF1F0', fg: '#CF1322' };
  };
  const badge = getLabel(value);

  return (
    <View style={styles.accessRow}>
      <View style={styles.accessTop}>
        <View style={[styles.accessIconCircle, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.accessLabel}>{label}</Text>
        <View style={[styles.accessBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.accessBadgeText, { color: badge.fg }]}>{badge.text}</Text>
        </View>
      </View>

      {/* Segmented bar: 5 blocks */}
      <View style={styles.segmentRow}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={[
              styles.segment,
              { backgroundColor: i <= value ? '#2D9B57' : '#E8E8E8' }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Hero
  heroContainer: { width: '100%', height: 320, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 52,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 8,
    borderRadius: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 52,
    left: 60,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  heroInfo: { position: 'absolute', bottom: 20, left: 20, right: 20, marginBottom: 30},
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  heroAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  heroAddress: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  heroRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroRating: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // Content card
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    padding: 24,
    paddingBottom: 80,
  },

  // Sections
  section: { marginBottom: 28, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a', marginBottom: 14 },
  bodyText: { fontSize: 14, color: '#555', lineHeight: 22 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 14, color: '#555' },

  // Tag chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: '#DDD',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, backgroundColor: '#fff',
  },
  chipText: { fontSize: 13, color: '#333', fontWeight: '500' },

  // Accessibility rows
  accessRow: { marginBottom: 20 },
  accessTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  accessIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  accessLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  accessBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  accessBadgeText: { fontSize: 12, fontWeight: '700' },
  segmentRow: { flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 8, borderRadius: 4 },

  // Reviews
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  addReviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addReviewText: { color: '#2D60FF', fontWeight: '700', fontSize: 13 },
  reviewCard: { backgroundColor: '#F8F9FB', borderRadius: 14, padding: 14, marginBottom: 10 },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2D60FF', justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  reviewAuthor: { fontWeight: '700', color: '#1a1a1a', fontSize: 14, marginBottom: 3 },
  starsRow: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 20 },
  emptyReviews: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyText: { color: '#AAA', fontSize: 14 },
});