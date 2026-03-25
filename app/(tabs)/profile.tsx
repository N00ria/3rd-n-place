import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?u=johnny' }} 
            style={styles.avatar} 
          />
          <Text style={styles.userName}>Johnny A.</Text>
          <Text style={styles.userBio}>Student @ University of Michigan</Text>
          
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsContainer}>
          <StatItem label="Reviews" value="12" />
          <StatItem label="Saved" value="8" />
          <StatItem label="Photos" value="3" />
        </View>

        {/* CONTROLS / SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Accessibility Needs</Text>
          <ProfileMenuOption icon="volume-low-outline" label="Quiet Spaces Only" toggle />
          <ProfileMenuOption icon="sunny-outline" label="Dim Lighting Preferred" toggle />
          <ProfileMenuOption icon="bus-outline" label="Near Public Transit" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <ProfileMenuOption icon="notifications-outline" label="Notifications" />
          <ProfileMenuOption icon="lock-closed-outline" label="Privacy & Security" />
          <ProfileMenuOption icon="log-out-outline" label="Sign Out" color="#d32f2f" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper for Stat Numbers
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Helper for Menu Rows
function ProfileMenuOption({ icon, label, toggle, color = "#333" }: any) {
  return (
    <TouchableOpacity style={styles.menuRow}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      </View>
      {toggle ? (
        <Ionicons name="toggle" size={28} color="#2D60FF" />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#2D60FF', marginBottom: 15 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  userBio: { fontSize: 14, color: '#777', marginTop: 4 },
  editButton: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F4FF' },
  editButtonText: { color: '#2D60FF', fontWeight: 'bold' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, marginTop: 10 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  statLabel: { fontSize: 12, color: '#777' },
  section: { padding: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1a1a1a' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 8 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 15, fontSize: 16, fontWeight: '500' },
});