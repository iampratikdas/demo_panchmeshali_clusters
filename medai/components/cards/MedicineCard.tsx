import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/solid';
import { MedicalCard } from '@/components/cards/MedicalCard';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';
import type { MedicineTiming } from '@/types';

export interface MedicineCardProps {
  name: string;
  strength: string;
  color?: string;
  timings: MedicineTiming[];
  remainingDays: number;
  totalDays: number;
  reminderEnabled: boolean;
  completed?: boolean;
  onToggleReminder?: (enabled: boolean) => void;
  onToggleCompleted?: (completed: boolean) => void;
  className?: string;
}

const timingLabels: Record<MedicineTiming, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

export function MedicineCard({
  name,
  strength,
  color = colors.primary,
  timings,
  remainingDays,
  totalDays,
  reminderEnabled,
  completed = false,
  onToggleReminder,
  onToggleCompleted,
  className,
}: MedicineCardProps) {
  const progress = totalDays > 0 ? ((totalDays - remainingDays) / totalDays) * 100 : 0;

  return (
    <MedicalCard className={cn(className)}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-text-primary">{name}</Text>
          <Text className="mt-1 text-sm text-text-secondary">{strength}</Text>
        </View>

        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: `${color}33` }}
        >
          <Text className="text-xs font-semibold" style={{ color }}>
            {strength.split(' ').pop() ?? 'Rx'}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {timings.map((timing) => (
          <View
            key={timing}
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: colors.primaryMuted }}
          >
            <Text className="text-xs font-semibold text-text-primary">
              {timingLabels[timing]}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm text-text-secondary">
            {remainingDays} days remaining
          </Text>
          <Text className="text-sm font-semibold text-text-primary">
            {Math.round(progress)}%
          </Text>
        </View>

        <View className="h-2 overflow-hidden rounded-full bg-border">
          <View
            className="h-full rounded-full bg-secondary"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Switch
            value={reminderEnabled}
            onValueChange={onToggleReminder}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
            accessibilityLabel="Medicine reminder toggle"
          />
          <Text className="ml-2 text-sm text-text-secondary">Reminder</Text>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed }}
          onPress={() => onToggleCompleted?.(!completed)}
          className="min-h-12 flex-row items-center"
        >
          <View
            className={cn(
              'mr-2 h-6 w-6 items-center justify-center rounded-md border',
              completed ? 'border-secondary bg-secondary' : 'border-border bg-card',
            )}
          >
            {completed ? <CheckIcon color={colors.white} size={14} /> : null}
          </View>
          <Text className="text-sm font-medium text-text-primary">Taken today</Text>
        </Pressable>
      </View>
    </MedicalCard>
  );
}
