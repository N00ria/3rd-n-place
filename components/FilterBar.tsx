import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const AVAILABLE_FILTERS = ['Quiet', 'Wheelchair Accessible', 'Study Friendly', 'Neurodivergent Friendly'];

interface FilterBarProps {
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
}

export default function FilterBar({ selectedFilters, onToggleFilter }: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {AVAILABLE_FILTERS.map((filter) => {
        const isActive = selectedFilters.includes(filter);
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onToggleFilter(filter)}
            style={[styles.chip, isActive && styles.activeChip]}
          >
            <Text style={[styles.chipText, isActive && styles.activeChipText]}>{filter}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingLeft: 20, marginBottom: 15, maxHeight: 50 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  activeChip: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  chipText: { color: '#666', fontWeight: '600' },
  activeChipText: { color: '#fff' },
});