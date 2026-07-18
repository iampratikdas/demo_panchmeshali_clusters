import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CheckCircleIcon,
} from 'react-native-heroicons/outline';
import { CheckCircleIcon as CheckCircleSolid } from 'react-native-heroicons/solid';
import { useMedicine } from '@/hooks/useApi';
import { useAppStore } from '@/store';
import { colors, shadows } from '@/theme';
import type { MedicineTiming } from '@/types';

const TIMING_LABELS: Record<MedicineTiming, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

const TIMING_ICONS: Record<MedicineTiming, string> = {
  morning: '🌅',
  afternoon: '☀️',
  night: '🌙',
};

export default function MedicineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: medicine, isLoading } = useMedicine(id ?? '');
  const completedMedicines = useAppStore((s) => s.completedMedicines);
  const toggleMedicineComplete = useAppStore((s) => s.toggleMedicineComplete);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const completedTimings = useMemo(() => {
    if (!medicine) return [];
    const storeCompleted = completedMedicines[medicine.id] ?? [];
    const apiCompleted = (medicine as { completedToday?: MedicineTiming[] }).completedToday ?? [];
    return [...new Set([...apiCompleted, ...storeCompleted])];
  }, [medicine, completedMedicines]);

  if (isLoading || !medicine) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.secondary} size="large" />
      </SafeAreaView>
    );
  }

  const med = medicine as {
    name: string;
    dosage: string;
    frequency: string;
    color: string;
    image: string;
    timings: MedicineTiming[];
    remainingDays: number;
    duration: string;
    sideEffects: string[];
    notes: string;
    foodInstruction: string;
    reminderEnabled: boolean;
  };

  const totalDays = parseInt(med.duration, 10) || med.remainingDays + 5;
  const progress = Math.max(
    0,
    Math.min(100, ((totalDays - med.remainingDays) / totalDays) * 100),
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full bg-white"
          style={shadows.soft}
        >
          <ArrowLeftIcon size={22} strokeWidth={2} color={colors.textPrimary} />
        </Pressable>
        <Text className="ml-3 text-xl font-bold text-text-primary">Medicine Details</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center rounded-3xl bg-white p-6" style={shadows.soft}>
          <View
            className="h-24 w-24 items-center justify-center rounded-3xl"
            style={{ backgroundColor: med.color + '33' }}
          >
            <Text className="text-5xl">{med.image}</Text>
          </View>

          <View
            className="mt-4 rounded-full px-4 py-1.5"
            style={{ backgroundColor: med.color + '44' }}
          >
            <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: med.color }}>
              Active
            </Text>
          </View>

          <Text className="mt-4 text-2xl font-bold text-text-primary">{med.name}</Text>
          <Text className="mt-1 text-base text-text-secondary">
            {med.dosage} · {med.frequency}
          </Text>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <Text className="mb-4 text-base font-bold text-text-primary">Today's Schedule</Text>

          {med.timings.map((timing) => {
            const done = completedTimings.includes(timing);
            return (
              <Pressable
                key={timing}
                onPress={() => toggleMedicineComplete(medicine.id, timing)}
                className="mb-3 flex-row items-center rounded-2xl bg-background px-4 py-4"
              >
                <Text className="mr-3 text-xl">{TIMING_ICONS[timing]}</Text>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text-primary">
                    {TIMING_LABELS[timing]}
                  </Text>
                  <Text className="text-sm text-text-secondary">{med.dosage}</Text>
                </View>
                {done ? (
                  <CheckCircleSolid color={colors.secondary} size={28} />
                ) : (
                  <CheckCircleIcon color={colors.border} size={28} strokeWidth={2} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-text-primary">Progress</Text>
            <Text className="text-sm font-semibold text-secondary">
              {med.remainingDays} days left
            </Text>
          </View>

          <View className="mt-4 h-3 overflow-hidden rounded-full bg-background">
            <View
              className="h-full rounded-full"
              style={{ width: `${progress}%`, backgroundColor: colors.secondary }}
            />
          </View>

          <Text className="mt-2 text-xs text-text-secondary">
            {med.duration} course · {Math.round(progress)}% complete
          </Text>
        </View>

        <View className="mt-5 flex-row items-center justify-between rounded-3xl bg-white p-5" style={shadows.soft}>
          <View className="flex-row items-center">
            <BeakerIcon color={colors.secondary} size={22} strokeWidth={2} />
            <View className="ml-3">
              <Text className="text-base font-bold text-text-primary">Reminder</Text>
              <Text className="text-sm text-text-secondary">Daily dose notifications</Text>
            </View>
          </View>
          <Switch
            value={reminderEnabled ?? med.reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {med.sideEffects.length > 0 ? (
          <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
            <Text className="mb-3 text-base font-bold text-text-primary">Side Effects</Text>
            <View className="flex-row flex-wrap gap-2">
              {med.sideEffects.map((effect) => (
                <View key={effect} className="rounded-full bg-dangerMuted px-4 py-2">
                  <Text className="text-sm font-medium text-danger">{effect}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <Text className="text-base font-bold text-text-primary">Food Instructions</Text>
          <Text className="mt-2 text-sm leading-5 text-text-secondary">{med.foodInstruction}</Text>
        </View>

        {med.notes ? (
          <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
            <Text className="text-base font-bold text-text-primary">Notes</Text>
            <Text className="mt-2 text-sm leading-5 text-text-secondary">{med.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
