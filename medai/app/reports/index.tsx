import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, DocumentTextIcon } from 'react-native-heroicons/outline';
import { EmptyState, ReportCard } from '@/components';
import { useReports } from '@/hooks/useApi';
import { formatDate } from '@/utils/format';
import { colors, shadows } from '@/theme';
import type { ReportType } from '@/types';

const FILTER_TYPES: (ReportType | 'All')[] = [
  'All',
  'Blood Test',
  'MRI',
  'CT Scan',
  'X-Ray',
  'Ultrasound',
  'ECG',
];

export default function ReportsScreen() {
  const [filter, setFilter] = useState<ReportType | 'All'>('All');
  const { data: reports = [], isLoading } = useReports();

  const filtered = useMemo(() => {
    if (filter === 'All') return reports;
    return reports.filter((r) => r.type === filter);
  }, [reports, filter]);

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
        <Text className="ml-3 text-xl font-bold text-text-primary">Medical Reports</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 8 }}
      >
        {FILTER_TYPES.map((type) => {
          const selected = filter === type;
          return (
            <Pressable
              key={type}
              onPress={() => setFilter(type)}
              className="rounded-full px-4 py-2.5"
              style={{
                backgroundColor: selected ? colors.secondary : colors.white,
                ...(selected ? {} : shadows.soft),
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: selected ? colors.white : colors.textPrimary }}
              >
                {type}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-1 px-5">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={DocumentTextIcon}
            title="No reports found"
            description="Try adjusting your filter or upload a new report."
          />
        ) : (
          <FlashList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={({ item }) => {
              const report = item as {
                id: string;
                type: ReportType;
                date: string;
                doctorName: string;
                hospital: string;
                status: 'ready' | 'processing';
              };
              return (
                <ReportCard
                  type={report.type}
                  date={formatDate(report.date)}
                  doctorName={report.doctorName}
                  hospital={report.hospital}
                  status={report.status}
                  onPress={() => router.push(`/reports/${report.id}`)}
                />
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
