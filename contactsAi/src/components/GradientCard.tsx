import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface GradientCardProps {
  children: React.ReactNode;
  colors: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  delay?: number;
}

export const GradientCard: React.FC<GradientCardProps> = ({ 
  children, 
  colors, 
  style, 
  animated = true,
  delay = 0 
}) => {
  const Card = (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInUp.delay(delay).springify()}>
        {Card}
      </Animated.View>
    );
  }

  return <View>{Card}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  }
});
