import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// We define the props the card expects to receive
interface SpaceCardProps {
  name: string;
  address: string;
  hours: string;
  description: string;
  imageUrl: string;
  tags: { name: string; icon: any; type: 'ionicon' | 'material' }[];
  onPress: () => void;
}

export default function SpaceCard({ name, address, hours, description, imageUrl, tags, onPress }: SpaceCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* Hero Image */}
      <Image source={{ uri: imageUrl }} style={styles.image} />
      
      {/* Content Container */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{name}</Text>
        
        {/* Address & Hours Row */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#555" />
            <Text style={styles.infoText}>{address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#555" />
            <Text style={styles.infoText}>{hours}</Text>
          </View>
        </View>

        {/* Short Description */}
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>

        {/* Accessibility Tags/Chips */}
        <View style={styles.tagContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              {tag.type === 'ionicon' ? (
                <Ionicons name={tag.icon} size={14} color="#2e7d32" />
              ) : (
                <MaterialCommunityIcons name={tag.icon} size={14} color="#2e7d32" />
              )}
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    // Soft shadow mimicking Figma
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, 
    overflow: 'hidden', // Ensures the image respects the border radius
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#e0e0e0', // Placeholder color while loading
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoContainer: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Adds space between chips
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9', // Light green background from your Figma
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9', // Slightly darker green border
  },
  tagText: {
    color: '#2e7d32', // Dark green text
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});