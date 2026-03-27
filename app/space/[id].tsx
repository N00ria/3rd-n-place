import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, collection, onSnapshot, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../../firebaseConfig';
import { Space, AccessibilityFeatures, Feedback } from '../../types';
import ReviewModal, { AccessibilityScores } from '../../components/ReviewModal';
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

  const handleAddReview = async (rating: number, comment: string, accessibility: AccessibilityScores) => {
    const user = auth.currentUser;
    if (!user) { Alert.alert("Sign in required", "You must be signed in to leave a review."); return; }

    try {
      // 1. Save review document
      await addDoc(collection(db, 'spaces', id, 'feedback'), {
        rating, comment,
        userId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        accessibility,
      });

      // 2. Recalculate accessibility averages if any scores were given
      const hasScores = Object.values(accessibility).some(v => v && v > 0);
      if (hasScores) {
        const accessRef = doc(db, 'spaces', id, 'accessibility_features', 'details');
        const allReviews = [...reviews, { accessibility }];
        const totals: Record<string, { sum: number; count: number }> = {};

        allReviews.forEach(r => {
          const scores = (r as any).accessibility || {};
          Object.entries(scores).forEach(([key, val]) => {
            if (val && (val as number) > 0) {
              if (!totals[key]) totals[key] = { sum: 0, count: 0 };
              totals[key].sum += val as number;
              totals[key].count += 1;
            }
          });
        });

        const averaged: Record<string, number> = {};
        Object.entries(totals).forEach(([key, { sum, count }]) => {
          averaged[key] = Math.round((sum / count) * 10) / 10;
        });

        await setDoc(accessRef, averaged, { merge: true });
      }

      setModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not submit review.");
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2D60FF" />
    </View>
  );

  if (!space) return (
    <View style={styles.center}>
      <Text style={styles.notFoundText}>Space not found.</Text>
    </View>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: space.imageUrl || 'https://via.placeholder.com/400' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          {space.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{space.category}</Text>
            </View>
          )}

          <View style={styles.heroInfo}>
            <Text style={styles.heroTitle}>{space.name}</Text>
            {space.address ? (
              <View style={styles.heroRow}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroSubText}>{space.address}</Text>
              </View>
            ) : null}
            {avgRating ? (
              <View style={styles.heroRow}>
                <Ionicons name="star" size={13} color="#FFD700" />
                <Text style={styles.heroSubText}>
                  {avgRating} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── CONTENT CARD ── */}
        <View style={styles.contentCard}>

          {/* CONTACT & HOURS */}
          {(space.hours || space.phone || space.website) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Info</Text>
              {space.hours ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="time-outline" size={16} color="#2D60FF" />
                  </View>
                  <Text style={styles.infoText}>{space.hours}</Text>
                </View>
              ) : null}
              {space.phone ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="call-outline" size={16} color="#2D60FF" />
                  </View>
                  <Text style={styles.infoText}>{space.phone}</Text>
                </View>
              ) : null}
              {space.website ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="globe-outline" size={16} color="#2D60FF" />
                  </View>
                  <Text style={[styles.infoText, styles.linkText]}>{space.website}</Text>
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
                        ? <Ionicons name={icon} size={13} color="#2D60FF" />
                        : <MaterialCommunityIcons name={icon} size={13} color="#2D60FF" />
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Accessibility</Text>
              {!access && (
                <Text style={styles.sectionHint}>Rated by the community</Text>
              )}
            </View>
            {access ? (
              <>
                <AccessibilityRow label="Lighting"       value={access.lightingLevel  || 0} icon="sunny-outline"  color="#FFA940" />
                <AccessibilityRow label="Noise Level"    value={access.noiseLevel     || 0} icon="mic-outline"    color="#2D60FF" />
                <AccessibilityRow label="Physical Access" value={access.physicalAccess || 0} icon="body-outline"   color="#52C41A" />
                <AccessibilityRow label="Sensory"        value={access.sensory        || 0} icon="eye-outline"    color="#9B59B6" />
              </>
            ) : (
              <View style={styles.emptyAccess}>
                <Ionicons name="accessibility-outline" size={28} color="#CCC" />
                <Text style={styles.emptyAccessText}>
                  No accessibility scores yet.{'\n'}Leave a review to rate this space!
                </Text>
              </View>
            )}
          </View>

          {/* REVIEWS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
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
                {rev.comment ? (
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                ) : null}
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

// ── Segmented accessibility score row ──
function AccessibilityRow({ label, value, icon, color }: {
  label: string; value: number; icon: any; color: string;
}) {
  const getBadge = (v: number) => {
    if (v >= 4) return { text: 'Excellent', bg: '#E6F9EE', fg: '#2D9B57' };
    if (v >= 3) return { text: 'Good',      bg: '#FFF7E6', fg: '#D48806' };
    if (v > 0)  return { text: 'Poor',      bg: '#FFF1F0', fg: '#CF1322' };
    return { text: 'No data', bg: '#F5F5F5', fg: '#AAA' };
  };
  const badge = getBadge(value);

  return (
    <View style={styles.accessRow}>
      <View style={styles.accessTop}>
        <View style={[styles.accessIconCircle, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={17} color={color} />
        </View>
        <Text style={styles.accessLabel}>{label}</Text>
        <View style={[styles.accessBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.accessBadgeText, { color: badge.fg }]}>{badge.text}</Text>
        </View>
      </View>
      <View style={styles.segmentRow}>
        {[1,2,3,4,5].map(i => (
          <View key={i} style={[styles.segment, { backgroundColor: i <= value ? '#2D9B57' : '#EBEBEB' }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 16, color: '#888' },

  // Hero
  heroContainer: { width: '100%', height: 340, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', inset: 0 } as any,
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 8, borderRadius: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 54,
    left: 58,
    backgroundColor: 'white',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  categoryBadgeText: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  heroInfo: { position: 'absolute', bottom: 52, left: 20, right: 20 },
  heroTitle: { fontSize: 27, fontWeight: 'bold', color: 'white', marginBottom: 6 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  heroSubText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  // Content card
  contentCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -28,
    padding: 24, paddingBottom: 80,
  },

  // Sections
  section: { marginBottom: 28, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  sectionHint: { fontSize: 12, color: '#AAA' },
  bodyText: { fontSize: 14, color: '#555', lineHeight: 22 },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  infoIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 14, color: '#444', flex: 1 },
  linkText: { color: '#2D60FF' },

  // Tags
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20,
  },
  chipText: { fontSize: 13, color: '#2D60FF', fontWeight: '600' },

  // Accessibility
  accessRow: { marginBottom: 18 },
  accessTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  accessIconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  accessLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  accessBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  accessBadgeText: { fontSize: 12, fontWeight: '700' },
  segmentRow: { flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 8, borderRadius: 4 },
  emptyAccess: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  emptyAccessText: { color: '#AAA', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Reviews
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