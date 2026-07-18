import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  DocumentTextIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { OutlineButton, StatusBadge } from '@/components';
import { useReport } from '@/hooks/useApi';
import { formatDate } from '@/utils/format';
import { colors, shadows } from '@/theme';
import type { ReportType } from '@/types';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading } = useReport(id ?? '');

  const handleDownload = () => {
    Alert.alert('Download Started', 'Your report is being downloaded.');
  };

  if (isLoading || !report) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.secondary} size="large" />
      </SafeAreaView>
    );
  }

  const r = report as {
    type: ReportType;
    title: string;
    date: string;
    doctorName: string;
    hospital: string;
    summary: string;
    preview: string;
    status: 'ready' | 'processing';
  };

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
        <Text className="ml-3 flex-1 text-xl font-bold text-text-primary">Report Details</Text>
        <StatusBadge status={r.status} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl bg-white p-5" style={shadows.soft}>
          <Text className="text-sm font-semibold uppercase tracking-wide text-secondary">
            {r.type}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-text-primary">{r.title}</Text>

          <View className="mt-4 flex-row items-center">
            <CalendarDaysIcon color={colors.textSecondary} size={18} strokeWidth={2} />
            <Text className="ml-2 text-sm text-text-secondary">{formatDate(r.date)}</Text>
          </View>

          <View className="mt-2 flex-row items-center">
            <UserIcon color={colors.textSecondary} size={18} strokeWidth={2} />
            <Text className="ml-2 text-sm text-text-secondary">{r.doctorName}</Text>
          </View>

          <View className="mt-2 flex-row items-center">
            <BuildingOffice2Icon color={colors.textSecondary} size={18} strokeWidth={2} />
            <Text className="ml-2 flex-1 text-sm text-text-secondary">{r.hospital}</Text>
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <Text className="text-base font-bold text-text-primary">Summary</Text>
          <Text className="mt-2 text-sm leading-6 text-text-secondary">{r.summary}</Text>
        </View>

        <View
          className="mt-5 h-56 items-center justify-center rounded-3xl bg-background"
          style={shadows.soft}
        >
          <DocumentTextIcon color={colors.textSecondary} size={48} strokeWidth={1.5} />
          <Text className="mt-3 px-6 text-center text-sm leading-5 text-text-secondary">
            {r.preview}
          </Text>
        </View>

        <View className="mt-6">
          <OutlineButton
            label="Download report"
            fullWidth
            onPress={handleDownload}
            className="flex-row items-center justify-center"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
