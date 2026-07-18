import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { MedicalCard } from '@/components/cards/MedicalCard';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';
import type { AppointmentStatus } from '@/types';

export interface AppointmentCardProps {
  doctorName: string;
  specialization?: string;
  avatarUri?: string;
  date: string;
  time: string;
  hospital?: string;
  status: AppointmentStatus;
  onPress?: () => void;
  className?: string;
}

const appointmentStatusMap: Record<AppointmentStatus, StatusBadgeVariant> = {
  upcoming: 'upcoming',
  completed: 'completed',
  cancelled: 'cancelled',
};

export function AppointmentCard({
  doctorName,
  specialization,
  avatarUri,
  date,
  time,
  hospital,
  status,
  onPress,
  className,
}: AppointmentCardProps) {
  const content = (
    <>
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1 items-center pr-3">
          <Avatar uri={avatarUri} name={doctorName} size="md" />
          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-text-primary" numberOfLines={1}>
              {doctorName}
            </Text>
            {specialization ? (
              <Text className="mt-0.5 text-sm text-text-secondary" numberOfLines={1}>
                {specialization}
              </Text>
            ) : null}
          </View>
        </View>

        <StatusBadge status={appointmentStatusMap[status]} />
      </View>

      <View className="mt-4 rounded-2xl bg-background px-4 py-3">
        <View className="flex-row items-center">
          <CalendarDaysIcon color={colors.secondary} size={18} strokeWidth={2} />
          <Text className="ml-2 text-sm font-medium text-text-primary">{date}</Text>
        </View>

        <View className="mt-2 flex-row items-center">
          <ClockIcon color={colors.secondary} size={18} strokeWidth={2} />
          <Text className="ml-2 text-sm font-medium text-text-primary">{time}</Text>
        </View>

        {hospital ? (
          <View className="mt-2 flex-row items-center">
            <BuildingOffice2Icon color={colors.textSecondary} size={18} strokeWidth={2} />
            <Text className="ml-2 flex-1 text-sm text-text-secondary" numberOfLines={1}>
              {hospital}
            </Text>
          </View>
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
