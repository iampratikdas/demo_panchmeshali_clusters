import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { HealthMetricCard, SegmentedControl } from '@/components';
import { useHealthMetrics } from '@/hooks/useApi';
import { colors, shadows } from '@/theme';
import type { HealthMetricTrend } from '@/components';

type Period = 'weekly' | 'monthly' | 'yearly';

const PERIOD_OPTIONS = [
  { label: 'Weekly', value: 'weekly' as Period },
  { label: 'Monthly', value: 'monthly' as Period },
  { label: 'Yearly', value: 'yearly' as Period },
];

type MetricDataPoint = {
  date: string;
  value: number | { systolic: number; diastolic: number };
  label: string;
};

function extractValue(value: number | { systolic: number; diastolic: number }): number {
  if (typeof value === 'object' && value !== null && 'systolic' in value) {
    return value.systolic;
  }
  return value as number;
}

function MiniBarChart({
  data,
  color,
  label,
  unit,
}: {
  data: MetricDataPoint[];
  color: string;
  label: string;
  unit: string;
}) {
  const values = data.map((d) => extractValue(d.value));
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const latest = values[values.length - 1];

  return (
    <View className="rounded-3xl bg-white p-5" style={shadows.soft}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-bold text-text-primary">{label}</Text>
        <Text className="text-sm font-semibold text-secondary">
          {latest}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>

      <View className="h-24 flex-row items-end justify-between gap-1">
        {data.map((point, index) => {
          const val = extractValue(point.value);
          const height = ((val - min * 0.9) / (max - min * 0.9 || 1)) * 100;
          return (
            <View key={point.date} className="flex-1 items-center">
              <View
                className="w-full rounded-t-lg"
                style={{
                  height: `${Math.max(12, height)}%`,
                  backgroundColor: index === data.length - 1 ? color : color + '66',
                }}
              />
              <Text className="mt-2 text-[9px] text-text-secondary" numberOfLines={1}>
                {point.label.split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function mapTrend(trend: string): HealthMetricTrend {
  if (trend === 'up' || trend === 'down') return trend;
  return 'neutral';
}

export default function DashboardScreen() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { data: healthData, isLoading } = useHealthMetrics();

  if (isLoading || !healthData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.secondary} size="large" />
      </SafeAreaView>
    );
  }

  const { metrics } = healthData;
  const chartMetrics = [
    { key: 'weight', color: colors.secondary, data: metrics.weight },
    { key: 'bloodPressure', color: colors.danger, data: metrics.bloodPressure },
    { key: 'sugar', color: colors.warning, data: metrics.sugar },
    { key: 'heartRate', color: '#93C5FD', data: metrics.heartRate },
    { key: 'bmi', color: colors.primary, data: metrics.bmi },
    { key: 'water', color: '#14B8A6', data: metrics.water },
  ] as const;

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
        <Text className="ml-3 text-xl font-bold text-text-primary">Health Dashboard</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />

        <View className="mt-5 flex-row flex-wrap gap-3">
          {chartMetrics.map(({ key, data }) => {
            const current =
              typeof data.current === 'object' && data.current !== null && 'systolic' in data.current
                ? `${data.current.systolic}/${data.current.diastolic}`
                : String(data.current);

            return (
              <HealthMetricCard
                key={key}
                label={data.label}
                value={current}
                unit={data.unit}
                trend={mapTrend(data.trend)}
                className="w-[47%]"
                accentColor={
                  key === 'bloodPressure'
                    ? colors.dangerMuted
                    : key === 'sugar'
                      ? colors.warningMuted
                      : colors.primaryMuted
                }
              />
            );
          })}
        </View>

        <Text className="mb-4 mt-8 text-lg font-bold text-text-primary">Trends</Text>

        {chartMetrics.map(({ key, color, data }) => (
          <View key={key} className="mb-4">
            <MiniBarChart
              data={data.data as MetricDataPoint[]}
              color={color}
              label={data.label}
              unit={data.unit}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
