import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// CRITICAL: These IDs must match the ones in your AddSpaceModal
const CATEGORIES = [
  { id: 'quiet', label: 'Quiet Zone', icon: 'volume-mute-outline' },
  { id: 'wheelchair', label: 'Wheelchair Accessible', icon: 'body-outline' },
  { id: 'lighting', label: 'Dim Lighting', icon: 'sunny-outline' },
  { id: 'outlets', label: 'Power Outlets', icon: 'battery-charging-outline' },
  { id: 'gender', label: 'Gender Neutral', icon: 'transgender-outline' },
  { id: 'sensory', label: 'Sensory Friendly', icon: 'eye-outline' },
];

interface FilterDropdownProps {
  selectedFilters: string[];
  onToggleFilter: (filterId: string) => void; // Pass the ID, not the label
  onClear: () => void;
}

export default function FilterDropdown({ selectedFilters, onToggleFilter, onClear }: FilterDropdownProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* The Main Button */}
      <TouchableOpacity 
        style={[styles.button, selectedFilters.length > 0 && styles.buttonActive]} 
        onPress={() => setIsVisible(true)}
      >
        <Ionicons 
          name="options-outline" 
          size={20} 
          color={selectedFilters.length > 0 ? "#fff" : "#2D60FF"} 
        />
        <Text style={[styles.buttonText, selectedFilters.length > 0 && styles.buttonTextActive]}>
          Filters {selectedFilters.length > 0 ? `(${selectedFilters.length})` : ''}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={selectedFilters.length > 0 ? "#fff" : "#999"} 
        />
      </TouchableOpacity>

      {/* The Dropdown Modal */}
      <Modal visible={isVisible} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.dropdownCard}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Filter by Needs</Text>
              <TouchableOpacity onPress={onClear}>
                <Text style={styles.clearText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedFilters.includes(cat.id);
                return (
                  <TouchableOpacity 
                    key={cat.id} 
                    style={styles.item} 
                    onPress={() => onToggleFilter(cat.id)}
                  >
                    <View style={styles.itemLeft}>
                       <Ionicons name={cat.icon as any} size={20} color="#666" style={{marginRight: 10}} />
                       <Text style={[styles.itemText, isSelected && styles.itemTextActive]}>
                         {cat.label}
                       </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-sharp" size={22} color="#2D60FF" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setIsVisible(false)}
            >
              <Text style={styles.applyButtonText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginHorizontal: 20, 
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    // Subtle shadow for the "floating" look
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  buttonActive: { backgroundColor: '#2D60FF' },
  buttonText: { marginHorizontal: 8, fontWeight: '700', color: '#333', fontSize: 15 },
  buttonTextActive: { color: '#fff' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20 
  },
  headerText: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  clearText: { color: '#FF4B4B', fontWeight: '700', fontSize: 14 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { fontSize: 16, color: '#444', fontWeight: '500' },
  itemTextActive: { color: '#2D60FF', fontWeight: '700' },
  applyButton: {
    backgroundColor: '#2D60FF',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});