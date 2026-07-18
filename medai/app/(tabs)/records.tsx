import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FloatingActionButton,
  PrescriptionCard,
  SearchBar,
  SkeletonCard,
  TimelineCard,
} from '@/components';
import { useHistory, usePrescriptions } from '@/hooks/useApi';
import type { HistoryEventType } from '@/types';
import { formatDate } from '@/utils/format';

type RecordFilter = 'all' | 'visit' | 'lab' | 'medicine' | 'upload';

const FILTER_OPTIONS: { label: string; value: RecordFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Visits', value: 'visit' },
  { label: 'Labs', value: 'lab' },
  { label: 'Medicines', value: 'medicine' },
  { label: 'Uploads', value: 'upload' },
];

interface FlatHistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: HistoryEventType;
  details?: unknown;
  year: number;
}

export default function RecordsScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<RecordFilter>('all');
  const { data: history, isLoading: historyLoading } = useHistory();
  const { data: prescriptions, isLoading: rxLoading } = usePrescriptions();

  const flatEvents = useMemo<FlatHistoryEvent[]>(() => {
    if (!history?.timeline) return [];
    return history.timeline.flatMap((yearGroup) =>
      yearGroup.events.map((event) => ({
        id: event.id,
        date: event.date,
        title: event.title,
        description: event.description,
        type: event.type as HistoryEventType,
        details: event.details,
        year: yearGroup.year,
      })),
    );
  }, [history]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flatEvents.filter((event) => {
      const matchesFilter = filter === 'all' || event.type === filter;
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [flatEvents, filter, search]);

  const isLoading = historyLoading || rxLoading;

  const ListHeader = (
    <View className="pb-2">
      <Text className="text-2xl font-bold text-text-primary">Medical Records</Text>
      <Text className="mt-1 text-sm text-text-secondary">
        Your complete health timeline and prescriptions
      </Text>

      <View className="mt-5">
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search records, visits, labs..."
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerClassName="gap-2"
      >
        {FILTER_OPTIONS.map((option) => {
          const selected = filter === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2.5 ${
                selected ? 'bg-text-primary' : 'border border-border bg-card'
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selected ? 'text-white' : 'text-text-primary'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {prescriptions && prescriptions.length > 0 ? (
        <View className="mt-6">
          <Text className="mb-3 text-lg font-bold text-text-primary">Prescriptions</Text>
          {prescriptions.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              className="mb-3"
              doctorName={rx.doctorName}
              hospital={rx.verifiedBy ?? rx.pharmacy ?? ''}
              date={formatDate(rx.issuedDate)}
              medicineCount={rx.medicines?.length ?? rx.medicineIds?.length ?? 0}
              status={rx.status as 'verified' | 'pending' | 'expired'}
              onPress={() => router.push(`/prescription/${rx.id}`)}
            />
          ))}
        </View>
      ) : null}

      <Text className="mb-3 mt-6 text-lg font-bold text-text-primary">Timeline</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-5 pt-2">
          <SkeletonCard lines={1} showAvatar={false} />
          <SkeletonCard lines={3} className="mt-4" />
          <SkeletonCard lines={3} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5 pt-2">
        <FlashList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <TimelineCard
              date={formatDate(item.date)}
              title={item.title}
              description={item.description}
              type={item.type}
              details={
                item.details
                  ? JSON.stringify(item.details, null, 2)
                  : item.description
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-base text-text-secondary">No records found</Text>
            </View>
          }
        />
      </View>

      <View className="absolute bottom-28 right-6">
        <FloatingActionButton
          onPress={() => router.push('/prescription/upload')}
          accessibilityLabel="Upload prescription"
        />
      </View>
    </SafeAreaView>
  );
}
