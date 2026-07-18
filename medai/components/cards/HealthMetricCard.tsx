import React from 'react';
import { Text, View } from 'react-native';
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from 'react-native-heroicons/solid';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export type HealthMetricTrend = 'up' | 'down' | 'neutral';

export interface HealthMetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: HealthMetricTrend;
  trendLabel?: string;
  accentColor?: string;
  className?: string;
}

const trendConfig: Record<
  HealthMetricTrend,
  { icon: typeof ArrowUpIcon; color: string; bg: string }
> = {
  up: { icon: ArrowUpIcon, color: colors.success, bg: colors.successMuted },
  down: { icon: ArrowDownIcon, color: colors.danger, bg: colors.dangerMuted },
  neutral: { icon: MinusIcon, color: colors.textSecondary, bg: colors.background },
};

export function HealthMetricCard({
  label,
  value,
  unit,
  trend = 'neutral',
  trendLabel,
  accentColor = colors.primaryMuted,
  className,
}: HealthMetricCardProps) {
  const trendStyle = trendConfig[trend];
  const TrendIcon = trendStyle.icon;

  return (
    <View
      className={cn('min-h-[120px] rounded-3xl p-4', className)}
      style={{ backgroundColor: accentColor }}
    >
      <Text className="text-sm font-medium text-text-secondary">{label}</Text>

      <View className="mt-2 flex-row items-end">
        <Text className="text-2xl font-bold text-text-primary">{value}</Text>
        {unit ? (
          <Text className="mb-1 ml-1 text-sm font-medium text-text-secondary">{unit}</Text>
        ) : null}
      </View>

      <View className="mt-3 flex-row items-center self-start rounded-full px-2.5 py-1" style={{ backgroundColor: trendStyle.bg }}>
        <TrendIcon color={trendStyle.color} size={12} />
        <Text className="ml-1 text-xs font-semibold" style={{ color: trendStyle.color }}>
          {trendLabel ?? (trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable')}
        </Text>
      </View>
    </View>
  );
}
