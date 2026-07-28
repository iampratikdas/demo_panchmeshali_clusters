import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { Sparkles, Search } from 'lucide-react-native';

interface SegmentedControlProps {
  options: { label: string; id: string; icon?: 'sparkles' | 'search' }[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selectedId, onSelect }) => {
  const offset = useSharedValue(options.findIndex(o => o.id === selectedId));

  React.useEffect(() => {
    offset.value = withSpring(options.findIndex(o => o.id === selectedId), { damping: 20, stiffness: 200 });
  }, [selectedId, options]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: `${offset.value * (100 / options.length)}%`,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.indicator,
          { width: `${100 / options.length}%` },
          animatedStyle,
        ]}
      />
      {options.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <Pressable
            key={option.id}
            style={styles.option}
            onPress={() => onSelect(option.id)}
          >
            {option.icon === 'sparkles' && (
              <Sparkles 
                color={isSelected ? Colors.text : Colors.textMuted} 
                size={16} 
                style={styles.icon} 
              />
            )}
            {option.icon === 'search' && (
              <Search 
                color={isSelected ? Colors.text : Colors.textMuted} 
                size={16} 
                style={styles.icon} 
              />
            )}
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.cardHighlight,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    marginBottom: 24,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  labelSelected: {
    color: Colors.text,
  },
});
