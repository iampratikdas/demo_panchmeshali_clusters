import React from 'react';
import { Text, View } from 'react-native';
import { ClockIcon, StarIcon } from 'react-native-heroicons/solid';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { MedicalCard } from '@/components/cards/MedicalCard';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export interface DoctorCardProps {
  name: string;
  specialization: string;
  avatarUri?: string;
  availability?: string;
  rating?: number;
  reviews?: number;
  isOnline?: boolean;
  showBookButton?: boolean;
  onBookPress?: () => void;
  onPress?: () => void;
  className?: string;
}

export function DoctorCard({
  name,
  specialization,
  avatarUri,
  availability = 'Available today',
  rating = 4.8,
  reviews = 0,
  isOnline,
  showBookButton = false,
  onBookPress,
  onPress,
  className,
}: DoctorCardProps) {
  return (
    <MedicalCard className={cn('overflow-hidden', className)}>
      <View className="flex-row items-center">
        <Avatar uri={avatarUri} name={name} size="lg" online={isOnline} />

        <View className="ml-4 flex-1">
          <Text className="text-base font-bold text-text-primary" numberOfLines={1}>
            {name}
          </Text>
          <Text className="mt-0.5 text-sm text-text-secondary" numberOfLines={1}>
            {specialization}
          </Text>

          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View className="flex-row items-center rounded-full bg-warningMuted px-2.5 py-1">
              <StarIcon color={colors.warning} size={14} />
              <Text className="ml-1 text-xs font-semibold text-text-primary">
                {rating.toFixed(1)}
              </Text>
              {reviews > 0 ? (
                <Text className="ml-1 text-xs text-text-secondary">({reviews})</Text>
              ) : null}
            </View>

            <View className="flex-row items-center">
              <ClockIcon color={colors.secondary} size={14} />
              <Text className="ml-1 text-xs text-text-secondary" numberOfLines={1}>
                {availability}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {showBookButton ? (
        <View className="mt-4">
          <PrimaryButton
            label="Book now"
            showArrow
            variant="full"
            onPress={onBookPress ?? onPress}
          />
        </View>
      ) : null}
    </MedicalCard>
  );
}
