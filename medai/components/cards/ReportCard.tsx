import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { MedicalCard } from '@/components/cards/MedicalCard';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';
import type { ReportType } from '@/types';

export interface ReportCardProps {
  type: ReportType;
  date: string;
  doctorName: string;
  hospital: string;
  status?: 'ready' | 'processing';
  onDownload?: () => void;
  onPress?: () => void;
  className?: string;
}

export function ReportCard({
  type,
  date,
  doctorName,
  hospital,
  status = 'ready',
  onDownload,
  onPress,
  className,
}: ReportCardProps) {
  const content = (
    <>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-text-primary">{type}</Text>
          <View className="mt-2 flex-row items-center">
            <CalendarDaysIcon color={colors.textSecondary} size={16} strokeWidth={2} />
            <Text className="ml-2 text-sm text-text-secondary">{date}</Text>
          </View>
        </View>
        <StatusBadge status={status} />
      </View>

      <View className="mt-3 flex-row items-center">
        <UserIcon color={colors.textSecondary} size={16} strokeWidth={2} />
        <Text className="ml-2 text-sm text-text-secondary">{doctorName}</Text>
      </View>

      <View className="mt-1.5 flex-row items-center">
        <BuildingOffice2Icon color={colors.textSecondary} size={16} strokeWidth={2} />
        <Text className="ml-2 flex-1 text-sm text-text-secondary" numberOfLines={1}>
          {hospital}
        </Text>
      </View>

      <View
        className="mt-4 h-28 items-center justify-center rounded-2xl border border-dashed border-border"
        style={{ backgroundColor: colors.background }}
      >
        <DocumentTextIcon color={colors.textSecondary} size={28} strokeWidth={1.5} />
        <Text className="mt-2 text-xs text-text-secondary">Report preview unavailable</Text>
      </View>

      {onDownload ? (
        <View className="mt-4">
          <OutlineButton
            label="Download report"
            fullWidth
            onPress={onDownload}
            className="flex-row"
          />
        </View>
      ) : null}
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
