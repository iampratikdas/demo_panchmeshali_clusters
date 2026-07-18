import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  BeakerIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from 'react-native-heroicons/outline';
import { MedicalCard } from '@/components/cards/MedicalCard';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';
import type { HistoryEventType } from '@/types';

export interface TimelineCardProps {
  date: string;
  title: string;
  description: string;
  type: HistoryEventType;
  details?: string;
  defaultExpanded?: boolean;
  className?: string;
}

const typeConfig: Record<
  HistoryEventType,
  { icon: typeof HeartIcon; bg: string; color: string }
> = {
  visit: { icon: HeartIcon, bg: colors.dangerMuted, color: colors.danger },
  upload: { icon: DocumentTextIcon, bg: colors.primaryMuted, color: colors.secondary },
  medicine: { icon: BeakerIcon, bg: colors.secondaryMuted, color: colors.secondary },
  diagnosis: { icon: ClipboardDocumentCheckIcon, bg: colors.warningMuted, color: colors.warning },
  vaccination: { icon: ShieldCheckIcon, bg: colors.successMuted, color: colors.success },
  lab: { icon: BeakerIcon, bg: colors.primaryMuted, color: colors.secondary },
  checkup: { icon: HeartIcon, bg: colors.secondaryMuted, color: colors.secondary },
};

export function TimelineCard({
  date,
  title,
  description,
  type,
  details,
  defaultExpanded = false,
  className,
}: TimelineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const progress = useSharedValue(defaultExpanded ? 1 : 0);
  const config = typeConfig[type];
  const Icon = config.icon;

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 240 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxHeight: progress.value * 160,
    marginTop: progress.value * 12,
    overflow: 'hidden',
  }));

  return (
    <MedicalCard className={cn(className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={toggleExpanded}
        className="min-h-12 flex-row items-start"
      >
        <View
          className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: config.bg }}
        >
          <Icon color={config.color} size={20} strokeWidth={2} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-base font-bold text-text-primary">{title}</Text>
              <View className="mt-1 flex-row items-center">
                <CalendarDaysIcon color={colors.textSecondary} size={14} strokeWidth={2} />
                <Text className="ml-1.5 text-xs text-text-secondary">{date}</Text>
              </View>
            </View>

            <Animated.View style={chevronStyle}>
              <ChevronDownIcon color={colors.textSecondary} size={20} strokeWidth={2} />
            </Animated.View>
          </View>

          <Text className="mt-2 text-sm leading-5 text-text-secondary">{description}</Text>

          {details ? (
            <Animated.View style={bodyStyle}>
              <Text className="text-sm leading-5 text-text-primary">{details}</Text>
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
    </MedicalCard>
  );
}
