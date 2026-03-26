import React, { useEffect, useState } from 'react'; // Added useEffect and useState
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';

// Firebase
import { auth, db } from '../../firebaseConfig'; // Ensure this path is correct
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Components
import AddSpaceModal from '../../components/AddSpaceModal';

export default function TabLayout() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Auth detected user:", user.uid);
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
            console.log("Successfully created Firestore profile!");
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
        
        {/* 1. DISCOVER TAB */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="compass" size={28} color={color} />,
          }}
        />

        {/* 2. THE FLOATING ADD BUTTON (Middle) */}
        <Tabs.Screen
          name="add-placeholder" // This is a dummy tab
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

        {/* 3. PROFILE TAB */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
          }}
        />
      </Tabs>

      {/* THE MODAL */}
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
    height: Platform.OS === 'ios' ? 88 : 70,
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'absolute', // Allows the plus button to "float" over the screen
  },
  plusButtonContainer: {
    top: -20, // Halfway above the bar
    justifyContent: 'center',
    alignItems: 'center',
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