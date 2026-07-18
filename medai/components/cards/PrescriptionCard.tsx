import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
} from 'react-native-heroicons/outline';
import { BeakerIcon } from 'react-native-heroicons/solid';
import { MedicalCard } from '@/components/cards/MedicalCard';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';
import type { PrescriptionStatus } from '@/types';

export interface PrescriptionCardProps {
  doctorName: string;
  hospital: string;
  date: string;
  medicineCount: number;
  status: PrescriptionStatus;
  onPress?: () => void;
  className?: string;
}

const prescriptionStatusMap: Record<PrescriptionStatus, StatusBadgeVariant> = {
  verified: 'verified',
  pending: 'pending',
  expired: 'expired',
};

export function PrescriptionCard({
  doctorName,
  hospital,
  date,
  medicineCount,
  status,
  onPress,
  className,
}: PrescriptionCardProps) {
  const content = (
    <>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-text-primary">{doctorName}</Text>
          <View className="mt-2 flex-row items-center">
            <BuildingOffice2Icon color={colors.textSecondary} size={16} strokeWidth={2} />
            <Text className="ml-2 flex-1 text-sm text-text-secondary" numberOfLines={1}>
              {hospital}
            </Text>
          </View>
          <View className="mt-1.5 flex-row items-center">
            <CalendarDaysIcon color={colors.textSecondary} size={16} strokeWidth={2} />
            <Text className="ml-2 text-sm text-text-secondary">{date}</Text>
          </View>
        </View>

        <StatusBadge status={prescriptionStatusMap[status]} />
      </View>

      <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-background px-4 py-3">
        <View className="flex-row items-center">
          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primaryMuted }}
          >
            <BeakerIcon color={colors.secondary} size={18} />
          </View>
          <View>
            <Text className="text-sm font-semibold text-text-primary">
              {medicineCount} {medicineCount === 1 ? 'Medicine' : 'Medicines'}
            </Text>
            <Text className="text-xs text-text-secondary">Prescribed dosage schedule</Text>
          </View>
        </View>

        {onPress ? (
          <ChevronRightIcon color={colors.textSecondary} size={20} strokeWidth={2} />
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <MedicalCard className={cn(className)}>{content}</MedicalCard>
      </Pressable>
    );
  }

  return <MedicalCard className={cn(className)}>{content}</MedicalCard>;
}
