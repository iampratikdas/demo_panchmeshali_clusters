import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { cn } from '@/components/lib/cn';
import { colors, shadows } from '@/theme';

export interface MedicalCardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  className?: string;
}

export function MedicalCard({
  children,
  padded = true,
  className,
  style,
  ...props
}: MedicalCardProps) {
  return (
    <View
      {...props}
      className={cn('rounded-3xl bg-card', padded && 'p-5', className)}
      style={[styles.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.soft,
    backgroundColor: colors.card,
  },
});
