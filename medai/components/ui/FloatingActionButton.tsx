import React from 'react';
import { StyleSheet } from 'react-native';
import { PlusIcon } from 'react-native-heroicons/outline';
import { AnimatedPressable } from '@/components/lib/AnimatedPressable';
import { colors, shadows } from '@/theme';

export interface FloatingActionButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export function FloatingActionButton({
  onPress,
  disabled = false,
  testID,
  accessibilityLabel = 'Add',
}: FloatingActionButtonProps) {
  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      scaleValue={0.92}
      style={[styles.base, shadows.fab, disabled && styles.disabled]}
    >
      <PlusIcon color={colors.white} size={28} strokeWidth={2.5} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.textPrimary,
  },
  disabled: {
    opacity: 0.5,
  },
});
