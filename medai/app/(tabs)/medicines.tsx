import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicineCard, SegmentedControl, SkeletonCard } from '@/components';
import { useMedicines } from '@/hooks/useApi';
import { colors } from '@/theme';
import type { MedicineTiming } from '@/types';

type MedicineTab = 'all' | 'today';

interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  timings: MedicineTiming[];
  remainingDays: number;
  duration: string;
  color: string;
  reminderEnabled: boolean;
  completedToday: MedicineTiming[];
}

const SCHEDULE_SLOTS: { period: MedicineTiming; label: string; time: string }[] = [
  { period: 'morning', label: 'Morning', time: '8 AM' },
  { period: 'afternoon', label: 'Afternoon', time: '12 PM' },
  { period: 'night', label: 'Night', time: '8 PM' },
];

function parseTotalDays(duration: string, remainingDays: number): number {
  const parsed = parseInt(String(duration), 10);
  return parsed || remainingDays + 5;
}

export default function MedicinesScreen() {
  const { data: medicines, isLoading } = useMedicines();
  const [tab, setTab] = useState<MedicineTab>('all');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const medicineList = useMemo(
    () => (medicines ?? []) as unknown as MedicineItem[],
    [medicines],
  );

  const todayMedicines = useMemo(
    () => medicineList.filter((med) => med.timings.length > 0),
    [medicineList],
  );

  const displayedMedicines = tab === 'today' ? todayMedicines : medicineList;

  const toggleReminder = (id: string, current: boolean) => {
    setReminders((prev) => ({ ...prev, [id]: !current }));
  };

  const getReminderEnabled = (med: MedicineItem) =>
    reminders[med.id] ?? med.reminderEnabled;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-5 pt-2">
          <SkeletonCard lines={1} showAvatar={false} />
          <SkeletonCard lines={4} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-text-primary">Medicines</Text>
        <Text className="mt-1 text-sm text-text-secondary">
          Track doses, reminders, and your daily schedule
        </Text>

        <View className="mt-5">
          <SegmentedControl
            options={[
              { label: 'All', value: 'all' },
              { label: 'Today', value: 'today' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </View>

        {tab === 'today' ? (
          <View className="mt-6">
            <Text className="mb-4 text-lg font-bold text-text-primary">Today&apos;s Schedule</Text>
            {SCHEDULE_SLOTS.map((slot) => {
              const slotMeds = todayMedicines.filter((med) =>
                med.timings.includes(slot.period),
              );
              if (slotMeds.length === 0) return null;

              return (
                <View key={slot.period} className="mb-5">
                  <View className="mb-3 flex-row items-center">
                    <View className="h-3 w-3 rounded-full bg-secondary" />
                    <Text className="ml-2 text-sm font-bold text-text-primary">
                      {slot.label}
                    </Text>
                    <Text className="ml-2 text-sm text-text-secondary">{slot.time}</Text>
                    <View className="ml-3 h-px flex-1 bg-border" />
                  </View>

                  {slotMeds.map((med) => {
                    const taken = med.completedToday.includes(slot.period);
                    return (
                      <Pressable
                        key={`${med.id}-${slot.period}`}
                        onPress={() => router.push(`/medicine/${med.id}`)}
                        className="mb-2 flex-row items-center rounded-2xl bg-card px-4 py-3"
                        style={{
                          shadowColor: colors.textPrimary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.04,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        <View
                          className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${med.color}33` }}
                        >
                          <Text className="text-lg">💊</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-text-primary">
                            {med.name}
                          </Text>
                          <Text className="text-xs text-text-secondary">{med.dosage}</Text>
                        </View>
                        <View
                          className={`rounded-full px-3 py-1 ${
                            taken ? 'bg-successMuted' : 'bg-primaryMuted'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              taken ? 'text-success' : 'text-text-secondary'
                            }`}
                          >
                            {taken ? 'Taken' : 'Pending'}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>
        ) : null}

        <View className="mt-6">
          <Text className="mb-4 text-lg font-bold text-text-primary">
            {tab === 'today' ? 'All Medicines' : 'Your Medicines'}
          </Text>

          {displayedMedicines.map((med) => {
            const totalDays = parseTotalDays(med.duration, med.remainingDays);
            const allTimingsTaken =
              med.timings.length > 0 &&
              med.timings.every((t) => med.completedToday.includes(t));

            return (
              <Pressable
                key={med.id}
                onPress={() => router.push(`/medicine/${med.id}`)}
                className="mb-4"
              >
                <MedicineCard
                  name={med.name}
                  strength={med.dosage}
                  color={med.color}
                  timings={med.timings}
                  remainingDays={med.remainingDays}
                  totalDays={totalDays}
                  reminderEnabled={getReminderEnabled(med)}
                  completed={allTimingsTaken}
                  onToggleReminder={(enabled) => toggleReminder(med.id, !enabled)}
                />
              </Pressable>
            );
          })}

          {displayedMedicines.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-base text-text-secondary">No medicines found</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
