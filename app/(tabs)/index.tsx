import React, { useEffect, useState } from 'react';


import { 
  FlatList, 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';

// Firebase
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Custom Components
import SpaceCard from '../../components/SpaceCard';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import { getTagIcon } from '../../utils/icons';

export default function DiscoverScreen() {
  const [allSpaces, setAllSpaces] = useState<any[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  const router = useRouter();

  // 1. REAL-TIME FIREBASE FETCH
  useEffect(() => {
    // We order by 'createdAt' so newest spaces show up at the top
    const q = query(
      collection(db, 'spaces'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const spacesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort newest first
      spacesData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setAllSpaces(spacesData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });
    
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // 2. THE FILTER ENGINE
  useEffect(() => {
  let result = allSpaces;

  // 1. Filter by Search Query
  if (searchQuery.trim() !== '') {
    result = result.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 2. Filter by Accessibility Tags (The Magic Part)
  if (selectedFilters.length > 0) {
    result = result.filter(space => {
      // Check if EVERY selected filter ID exists in this space's tags array
      return selectedFilters.every(filterId => 
        space.tags && space.tags.includes(filterId)
      );
    });
  }

  setFilteredSpaces(result);
}, [searchQuery, selectedFilters, allSpaces]);

  // Dynamic Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date()).toUpperCase();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2D60FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.blueHeader}>
        <SafeAreaView>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Text style={styles.greetingText}>{getGreeting()}, Johnny</Text>
            </View>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=johnny' }} 
              style={styles.profilePic} 
            />
          </View>
          
          <View style={styles.brandContent}>
             <Text style={styles.brandTitle}>Find Your Perfect Third Space</Text>
             <Text style={styles.brandSubtitle}>Discover Welcoming Spaces with 3rd 'n Place</Text>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.floatingSearchContainer}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          placeholder="Search cafes, libraries, parks..."
        />
        <FilterDropdown 
          selectedFilters={selectedFilters} 
          onToggleFilter={(f) => setSelectedFilters(prev => 
            prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
          )}
          onClear={() => setSelectedFilters([])}
        />
      </View>

      <FlatList
        data={filteredSpaces}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.resultsCount}>
            {filteredSpaces.length} {filteredSpaces.length === 1 ? 'Space' : 'Spaces'} Found
          </Text>
        }
        renderItem={({ item }) => (
          <SpaceCard 
            name={item.name}
            address={item.category || "General Space"} // Using category as a subtitle
            hours="Check website for hours"
            description={item.description}
            imageUrl={item.imageUrl}
            tags={(item.tags || []).map((t: string) => ({ name: t, ...getTagIcon(t) }))}
            onPress={() => router.push(`/space/${item.id}`)} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No spaces match your current filters.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blueHeader: {
    backgroundColor: '#2D60FF',
    paddingHorizontal: 20,
    paddingBottom: 80, 
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  dateText: { color: '#A5C0FF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  greetingText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 4 },
  profilePic: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },
  brandContent: { marginTop: 25 },
  brandTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  brandSubtitle: { color: '#A5C0FF', fontSize: 16, fontWeight: '600', marginTop: 4 },
  floatingSearchContainer: { marginTop: -50, zIndex: 10, elevation: 5 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  resultsCount: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },
  emptyState: { marginTop: 60, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});