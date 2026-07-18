import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { SearchBar } from '@/components';
import { useSearch } from '@/hooks/useApi';
import { useAppStore } from '@/store';
import { colors, shadows } from '@/theme';

type ResultType =
  | 'medicine'
  | 'doctor'
  | 'prescription'
  | 'history'
  | 'appointment'
  | 'report';

const TYPE_ICONS: Record<
  ResultType,
  typeof BeakerIcon
> = {
  medicine: BeakerIcon,
  doctor: UserIcon,
  prescription: DocumentTextIcon,
  history: ClockIcon,
  appointment: CalendarDaysIcon,
  report: DocumentTextIcon,
};

function routeForType(type: string, id: string): string {
  switch (type) {
    case 'medicine':
      return `/medicine/${id}`;
    case 'doctor':
      return '/appointment/book';
    case 'prescription':
      return `/prescription/${id}`;
    case 'appointment':
      return `/appointment/${id}`;
    case 'report':
      return `/reports/${id}`;
    case 'history':
      return '/history';
    default:
      return '/';
  }
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { data: results = [], isFetching } = useSearch(query);
  const recentSearches = useAppStore((s) => s.recentSearches);
  const addRecentSearch = useAppStore((s) => s.addRecentSearch);
  const clearRecentSearches = useAppStore((s) => s.clearRecentSearches);

  const showRecent = query.trim().length === 0;

  const groupedResults = useMemo(() => {
    const groups: Record<string, typeof results> = {};
    results.forEach((r) => {
      if (!groups[r.type]) groups[r.type] = [];
      groups[r.type].push(r);
    });
    return Object.entries(groups);
  }, [results]);

  const handleResultPress = (type: string, title: string, id: string) => {
    addRecentSearch(title);
    router.push(routeForType(type, id) as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-white"
          style={shadows.soft}
        >
          <ArrowLeftIcon size={22} strokeWidth={2} color={colors.textPrimary} />
        </Pressable>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search doctors, medicines, reports..."
          autoFocus
        />
      </View>

      {showRecent ? (
        <View className="flex-1 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-base font-bold text-text-primary">Recent Searches</Text>
            {recentSearches.length > 0 ? (
              <Pressable onPress={clearRecentSearches}>
                <Text className="text-sm font-medium text-secondary">Clear</Text>
              </Pressable>
            ) : null}
          </View>

          {recentSearches.map((term) => (
            <Pressable
              key={term}
              onPress={() => setQuery(term)}
              className="mb-3 flex-row items-center rounded-2xl bg-white px-4 py-4"
              style={shadows.soft}
            >
              <MagnifyingGlassIcon color={colors.textSecondary} size={20} strokeWidth={2} />
              <Text className="ml-3 text-base text-text-primary">{term}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View className="flex-1 px-5">
          {isFetching && results.length === 0 ? (
            <Text className="py-4 text-center text-sm text-text-secondary">Searching...</Text>
          ) : results.length === 0 ? (
            <View className="items-center py-12">
              <MagnifyingGlassIcon color={colors.textSecondary} size={40} strokeWidth={1.5} />
              <Text className="mt-4 text-base font-semibold text-text-primary">No results</Text>
              <Text className="mt-1 text-sm text-text-secondary">
                Try a different search term
              </Text>
            </View>
          ) : (
            <FlashList
              data={groupedResults}
              keyExtractor={([type]) => type}
              renderItem={({ item: [type, items] }) => {
                const Icon = TYPE_ICONS[type as ResultType] ?? DocumentTextIcon;
                return (
                  <View className="mb-6">
                    <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                      {type}
                    </Text>
                    {items.map((result) => (
                      <Pressable
                        key={result.id}
                        onPress={() => handleResultPress(result.type, result.title, result.id)}
                        className="mb-2 flex-row items-center rounded-2xl bg-white px-4 py-4"
                        style={shadows.soft}
                      >
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primaryMuted">
                          <Icon color={colors.secondary} size={20} strokeWidth={2} />
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-base font-semibold text-text-primary">
                            {result.title}
                          </Text>
                          <Text className="text-sm text-text-secondary">{result.subtitle}</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                );
              }}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
