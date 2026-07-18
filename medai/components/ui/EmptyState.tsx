import React from 'react';
import { Text, View } from 'react-native';
import type { ComponentType } from 'react';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export interface EmptyStateProps {
  icon?: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <View className={cn('items-center px-6 py-10', className)}>
      {Icon ? (
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primaryMuted">
          <Icon color={colors.secondary} size={32} strokeWidth={1.8} />
        </View>
      ) : null}

      <Text className="text-center text-lg font-semibold text-text-primary">{title}</Text>

      {description ? (
        <Text className="mt-2 text-center text-sm leading-5 text-text-secondary">
          {description}
        </Text>
      ) : null}

      {action ? <View className="mt-6 w-full max-w-xs">{action}</View> : null}
    </View>
  );
}
