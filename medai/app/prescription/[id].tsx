import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BeakerIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { StatusBadge } from '@/components';
import { useMedicines, usePrescription } from '@/hooks/useApi';
import { formatDate } from '@/utils/format';
import { colors, shadows } from '@/theme';
import type { MedicineTiming, PrescriptionStatus } from '@/types';

const TIMING_LABELS: Record<MedicineTiming, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

const statusMap: Record<PrescriptionStatus, 'verified' | 'pending' | 'expired'> = {
  verified: 'verified',
  pending: 'pending',
  expired: 'expired',
};

export default function PrescriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: prescription, isLoading } = usePrescription(id ?? '');
  const { data: allMedicines = [] } = useMedicines();

  if (isLoading || !prescription) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.secondary} size="large" />
      </SafeAreaView>
    );
  }

  const rx = prescription as {
    doctorName: string;
    issuedDate: string;
    verifiedBy: string | null;
    diagnosis: string;
    notes: string;
    status: PrescriptionStatus;
    medicineIds: string[];
    pharmacy?: string;
  };

  const medicines = allMedicines.filter((m) => rx.medicineIds.includes(m.id));

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
        <Text className="ml-3 flex-1 text-xl font-bold text-text-primary">Prescription</Text>
        <StatusBadge status={statusMap[rx.status]} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="h-56 items-center justify-center rounded-3xl bg-background"
          style={shadows.soft}
        >
          <DocumentTextIcon color={colors.textSecondary} size={56} strokeWidth={1.5} />
          <Text className="mt-3 text-base font-semibold text-text-secondary">PDF Preview</Text>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <View className="flex-row items-center">
            <UserIcon color={colors.secondary} size={20} strokeWidth={2} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-text-secondary">Prescribed by</Text>
              <Text className="text-base font-bold text-text-primary">{rx.doctorName}</Text>
            </View>
          </View>

          {rx.verifiedBy ? (
            <View className="mt-4 flex-row items-center">
              <BuildingOffice2Icon color={colors.textSecondary} size={20} strokeWidth={2} />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-text-secondary">Verified by</Text>
                <Text className="text-sm font-medium text-text-primary">{rx.verifiedBy}</Text>
              </View>
            </View>
          ) : null}

          <View className="mt-4 flex-row items-center">
            <CalendarDaysIcon color={colors.textSecondary} size={20} strokeWidth={2} />
            <View className="ml-3 flex-1">
              <Text className="text-xs text-text-secondary">Visit date</Text>
              <Text className="text-sm font-medium text-text-primary">
                {formatDate(rx.issuedDate)}
              </Text>
            </View>
          </View>

          <View className="mt-5 border-t border-border pt-4">
            <Text className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Diagnosis
            </Text>
            <Text className="mt-1 text-base font-semibold text-text-primary">{rx.diagnosis}</Text>
          </View>

          {rx.notes ? (
            <View className="mt-4">
              <Text className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Notes
              </Text>
              <Text className="mt-1 text-sm leading-5 text-text-secondary">{rx.notes}</Text>
            </View>
          ) : null}
        </View>

        <Text className="mb-3 mt-6 text-lg font-bold text-text-primary">Medicines</Text>

        {medicines.map((medicine) => {
          const med = medicine as {
            name: string;
            dosage: string;
            timings: MedicineTiming[];
            foodInstruction: string;
            duration: string;
            color: string;
          };

          return (
            <View key={medicine.id} className="mb-4 rounded-3xl bg-white p-5" style={shadows.soft}>
              <View className="flex-row items-center">
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: med.color + '33' }}
                >
                  <BeakerIcon color={med.color} size={20} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-text-primary">{med.name}</Text>
                  <Text className="text-sm text-text-secondary">{med.dosage}</Text>
                </View>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {med.timings.map((timing) => (
                  <View
                    key={timing}
                    className="rounded-full bg-primaryMuted px-3 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-secondary">
                      {TIMING_LABELS[timing]}
                    </Text>
                  </View>
                ))}
              </View>

              <Text className="mt-3 text-sm text-text-secondary">
                {med.foodInstruction} · {med.duration}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
