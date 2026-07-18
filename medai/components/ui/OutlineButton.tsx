import React from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AnimatedPressable } from '@/components/lib/AnimatedPressable';
import { colors, shadows } from '@/theme';

export interface OutlineButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  testID?: string;
}

export function OutlineButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  testID,
}: OutlineButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[styles.base, fullWidth && styles.full, shadows.soft, isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  full: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
