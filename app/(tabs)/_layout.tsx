import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AddSpaceModal from '../../components/AddSpaceModal';

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2D60FF',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        }}
      >
        {/* LEFT TAB: DISCOVER */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />,
            headerShown: false,
          }}
        />

        {/* CENTER TAB: THE PLUS BUTTON */}
       <Tabs.Screen
        name="add-placeholder" // <--- MUST MATCH THE FILENAME ABOVE
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setModalVisible(true);
          },
        }}
        options={{
          title: '', 
          tabBarIcon: () => (
            <View style={styles.plusButton}>
              <Ionicons name="add" size={32} color="white" />
            </View>
          ),
        }}
      />

        {/* RIGHT TAB: PROFILE */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
            headerShown: false,
          }}
        />
      </Tabs>

      {/* MODAL COMPONENT */}
      <AddSpaceModal 
        isVisible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    height: 70,
    borderTopWidth: 0,
    // This is the secret sauce: 
    // It prevents the tab bar from cutting off the floating button
    overflow: 'visible', 
    position: 'absolute',
  },
  plusButton: {
    backgroundColor: '#2D60FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    // Position it so it sits halfway above the bar
    top: -20, 
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#2D60FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});