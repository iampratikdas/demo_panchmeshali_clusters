import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ArrowRightIcon } from 'react-native-heroicons/outline';
import { AnimatedPressable } from '@/components/lib/AnimatedPressable';
import { colors, shadows } from '@/theme';

export type PrimaryButtonVariant = 'default' | 'full' | 'compact';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showArrow?: boolean;
  variant?: PrimaryButtonVariant;
  className?: string;
  testID?: string;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  showArrow = true,
  variant = 'default',
  testID,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.base,
        variant === 'full' && styles.full,
        variant === 'compact' && styles.compact,
        shadows.medium,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <>
          <Text style={variant === 'compact' ? styles.labelSmall : styles.label}>{label}</Text>
          {showArrow ? (
            <View style={styles.arrowCircle}>
              <ArrowRightIcon color={colors.textPrimary} size={16} strokeWidth={2.5} />
            </View>
          ) : null}
        </>
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
    backgroundColor: colors.textPrimary,
  },
  full: {
    width: '100%',
  },
  compact: {
    minHeight: 40,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  labelSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  arrowCircle: {
    marginLeft: 12,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
