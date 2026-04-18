import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';

// Firebase
import { auth, db } from '../../firebaseConfig'; 
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Components
import AddSpaceModal from '../../components/AddSpaceModal';

export default function TabLayout() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Johnny',
              photoURL: user.photoURL || 'https://i.pravatar.cc/150?u=johnny',
              createdAt: serverTimestamp(),
              isStudent: true,
              university: "University of Michigan"
            });
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <Tabs screenOptions={{ 
        tabBarActiveTintColor: '#2D60FF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
      }}>
        
        {/* 1. DISCOVER */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="compass" size={28} color={color} />,
          }}
        />

        {/* 2. THE FLOATING ADD BUTTON */}
        <Tabs.Screen
          name="add-placeholder" 
          options={{
            title: '',
            tabBarButton: (props) => (
              <TouchableOpacity 
                style={styles.plusButtonContainer} 
                onPress={() => setIsModalVisible(true)}
              >
                <View style={styles.plusButton}>
                  <Ionicons name="add" size={32} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />

        {/* 3. FORUM TAB (Newly Added) */}
        <Tabs.Screen
          name="forum"
          options={{
            title: 'Forum',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={26} color={color} />,
          }}
        />

        {/* 4. PROFILE TAB (Moved to the end) */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
          }}
        />
      </Tabs>

      <AddSpaceModal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    // Position absolute is key for the "floating" plus button
    height: Platform.OS === 'ios' ? 88 : 70,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'absolute', 
  },
  plusButtonContainer: {
    top: -20, 
    justifyContent: 'center',
    alignItems: 'center',
    width: 70, // Added width to ensure touch target is solid
  },
  plusButton: {
    backgroundColor: '#2D60FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#2D60FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});