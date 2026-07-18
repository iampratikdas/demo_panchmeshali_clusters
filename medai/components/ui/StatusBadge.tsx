import React from 'react';
import { Text, View } from 'react-native';
import {
  CheckBadgeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from 'react-native-heroicons/solid';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export type StatusBadgeVariant =
  | 'verified'
  | 'pending'
  | 'upcoming'
  | 'cancelled'
  | 'completed'
  | 'processing'
  | 'expired'
  | 'ready';

export interface StatusBadgeProps {
  status: StatusBadgeVariant;
  label?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  StatusBadgeVariant,
  { label: string; bg: string; text: string; iconColor: string }
> = {
  verified: {
    label: 'Verified',
    bg: 'bg-successMuted',
    text: 'text-success',
    iconColor: colors.success,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-warningMuted',
    text: 'text-warning',
    iconColor: colors.warning,
  },
  upcoming: {
    label: 'Upcoming',
    bg: 'bg-primaryMuted',
    text: 'text-secondary',
    iconColor: colors.secondary,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-dangerMuted',
    text: 'text-danger',
    iconColor: colors.danger,
  },
  completed: {
    label: 'Completed',
    bg: 'bg-successMuted',
    text: 'text-success',
    iconColor: colors.success,
  },
  processing: {
    label: 'Processing',
    bg: 'bg-warningMuted',
    text: 'text-warning',
    iconColor: colors.warning,
  },
  expired: {
    label: 'Expired',
    bg: 'bg-dangerMuted',
    text: 'text-danger',
    iconColor: colors.danger,
  },
  ready: {
    label: 'Ready',
    bg: 'bg-secondaryMuted',
    text: 'text-secondary',
    iconColor: colors.secondary,
  },
};

function StatusIcon({ status, color }: { status: StatusBadgeVariant; color: string }) {
  const iconProps = { size: 14, color };

  switch (status) {
    case 'verified':
    case 'completed':
    case 'ready':
      return <CheckBadgeIcon {...iconProps} />;
    case 'pending':
    case 'processing':
    case 'upcoming':
      return <ClockIcon {...iconProps} />;
    case 'cancelled':
    case 'expired':
      return <XCircleIcon {...iconProps} />;
    default:
      return <ExclamationTriangleIcon {...iconProps} />;
  }
}

export function StatusBadge({
  status,
  label,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label ?? config.label;

  return (
    <View
      className={cn(
        'min-h-7 flex-row items-center self-start rounded-full px-3 py-1',
        config.bg,
        className,
      )}
    >
      {showIcon ? (
        <View className="mr-1.5">
          <StatusIcon status={status} color={config.iconColor} />
        </View>
      ) : null}
      <Text className={cn('text-xs font-semibold capitalize', config.text)}>
        {displayLabel}
      </Text>
    </View>
  );
}
