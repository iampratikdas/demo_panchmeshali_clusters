import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  online?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  sm: { container: 'h-8 w-8', text: 'text-xs', indicator: 'h-2.5 w-2.5 border' },
  md: { container: 'h-10 w-10', text: 'text-sm', indicator: 'h-3 w-3 border-2' },
  lg: { container: 'h-14 w-14', text: 'text-lg', indicator: 'h-3.5 w-3.5 border-2' },
  xl: { container: 'h-[72px] w-[72px]', text: 'text-xl', indicator: 'h-4 w-4 border-2' },
};

function getInitials(name?: string) {
  if (!name?.trim()) {
    return '?';
  }

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function Avatar({
  uri,
  name,
  size = 'md',
  online,
  className,
}: AvatarProps) {
  const sizing = sizeMap[size];

  return (
    <View className={cn('relative', className)}>
      <View
        className={cn(
          'items-center justify-center overflow-hidden rounded-full bg-primaryMuted',
          sizing.container,
        )}
      >
        {uri ? (
          <Image
            source={{ uri }}
            contentFit="cover"
            className="h-full w-full"
            accessibilityLabel={name ? `${name} avatar` : 'Avatar'}
          />
        ) : (
          <Text className={cn('font-semibold text-text-primary', sizing.text)}>
            {getInitials(name)}
          </Text>
        )}
      </View>

      {online !== undefined ? (
        <View
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-card',
            sizing.indicator,
            online ? 'bg-success' : 'bg-text-secondary',
          )}
          style={{ borderColor: colors.card }}
        />
      ) : null}
    </View>
  );
}
