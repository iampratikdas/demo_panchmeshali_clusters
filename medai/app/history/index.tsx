import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { TimelineCard } from '@/components';
import { useHistory } from '@/hooks/useApi';
import { formatDate } from '@/utils/format';
import { colors, shadows } from '@/theme';
import type { HistoryEventType } from '@/types';

function formatEventDetails(details: Record<string, unknown> | undefined): string | undefined {
  if (!details || typeof details !== 'object') return undefined;
  return Object.entries(details)
    .map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      return `${label}: ${String(value)}`;
    })
    .join('\n');
}

export default function HistoryScreen() {
  const { data: history, isLoading } = useHistory();

  if (isLoading || !history) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.secondary} size="large" />
      </SafeAreaView>
    );
  }

  const timeline = [...history.timeline].sort((a, b) => b.year - a.year);

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
        <View className="ml-3">
          <Text className="text-xl font-bold text-text-primary">Medical History</Text>
          <Text className="text-sm text-text-secondary">Your complete health timeline</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {timeline.map((yearGroup) => (
          <View key={yearGroup.year} className="mb-8">
            <Text className="mb-6 text-3xl font-bold text-text-primary">{yearGroup.year}</Text>

            <View className="relative pl-6">
              <View
                className="absolute bottom-0 left-[7px] top-2 w-0.5"
                style={{ backgroundColor: colors.secondary + '44' }}
              />

              {yearGroup.events.map((event, index) => (
                <View key={event.id} className="relative mb-6">
                  <View
                    className="absolute -left-6 top-5 h-4 w-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: colors.secondary }}
                  />

                  <TimelineCard
                    date={formatDate(event.date, 'MMM d, yyyy')}
                    title={event.title}
                    description={event.description}
                    type={event.type as HistoryEventType}
                    details={formatEventDetails(
                      event.details as Record<string, unknown> | undefined,
                    )}
                    defaultExpanded={index === 0}
                    className="ml-2"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
