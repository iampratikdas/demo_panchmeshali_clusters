import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export interface SkeletonBoxProps extends ViewProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function SkeletonBox({
  width = '100%',
  height = 16,
  borderRadius = 12,
  className,
  style,
  ...props
}: SkeletonBoxProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      {...props}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
      className={cn(className)}
    />
  );
}

export interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  showAvatar = true,
  className,
}: SkeletonCardProps) {
  return (
    <View
      className={cn('rounded-3xl bg-card p-5', className)}
      style={styles.cardShadow}
    >
      <View className="flex-row items-center">
        {showAvatar ? <SkeletonBox width={48} height={48} borderRadius={24} /> : null}
        <View className={cn('flex-1', showAvatar && 'ml-4')}>
          <SkeletonBox width="70%" height={14} />
          <SkeletonBox width="45%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>

      <View className="mt-4">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonBox
            key={`skeleton-line-${index}`}
            width={index === lines - 1 ? '60%' : '100%'}
            height={12}
            style={index > 0 ? { marginTop: 8 } : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
