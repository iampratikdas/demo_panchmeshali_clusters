import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { cn } from '@/components/lib/cn';
import { colors, shadows } from '@/theme';

export interface SegmentedControlOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(selectedIndex * segmentWidth.value, {
      damping: 18,
      stiffness: 220,
    });
  }, [selectedIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth.value,
    transform: [{ translateX: translateX.value }],
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.card,
    ...shadows.soft,
  }));

  return (
    <View
      className={cn('rounded-full bg-background p-1', className)}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        const nextSegmentWidth = (width - 8) / options.length;
        segmentWidth.value = nextSegmentWidth;
        translateX.value = selectedIndex * nextSegmentWidth;
      }}
    >
      <View className="relative min-h-12 flex-row">
        <Animated.View pointerEvents="none" style={indicatorStyle} />

        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(option.value)}
              className="min-h-12 flex-1 items-center justify-center px-3"
            >
              <Text
                className={cn(
                  'text-sm font-semibold',
                  isSelected ? 'text-text-primary' : 'text-text-secondary',
                )}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
