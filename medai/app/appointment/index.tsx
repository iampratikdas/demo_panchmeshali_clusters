import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import {
  AppointmentCard,
  EmptyState,
  FloatingActionButton,
  SegmentedControl,
} from '@/components';
import { useAppointments, useDoctors } from '@/hooks/useApi';
import { formatDate } from '@/utils/format';
import type { AppointmentStatus } from '@/types';

type TabValue = 'upcoming' | 'past' | 'cancelled';

const TAB_OPTIONS = [
  { label: 'Upcoming', value: 'upcoming' as TabValue },
  { label: 'Past', value: 'past' as TabValue },
  { label: 'Cancelled', value: 'cancelled' as TabValue },
];

function statusForTab(tab: TabValue): AppointmentStatus {
  if (tab === 'past') return 'completed';
  return tab;
}

export default function AppointmentsScreen() {
  const [tab, setTab] = useState<TabValue>('upcoming');
  const { data: appointments = [], isLoading } = useAppointments();
  const { data: doctors = [] } = useDoctors();

  const filtered = useMemo(() => {
    const status = statusForTab(tab);
    return appointments.filter((a) => a.status === status);
  }, [appointments, tab]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: '#111827',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          <ArrowLeftIcon size={22} strokeWidth={2} color="#111827" />
        </Pressable>
        <Text className="ml-3 text-xl font-bold text-text-primary">Appointments</Text>
      </View>

      <View className="px-5 pb-4">
        <SegmentedControl options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </View>

      <View className="flex-1 px-5">
        {!isLoading && filtered.length === 0 ? (
          <EmptyState
            icon={CalendarDaysIcon}
            title={`No ${tab} appointments`}
            description="Book a consultation with your preferred doctor."
            action={
              <Pressable
                onPress={() => router.push('/appointment/book')}
                className="min-h-12 items-center justify-center rounded-full bg-text-primary px-6"
              >
                <Text className="font-semibold text-white">Book Appointment</Text>
              </Pressable>
            }
          />
        ) : (
          <FlashList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            ItemSeparatorComponent={() => <View className="h-4" />}
            renderItem={({ item }) => {
              const doctor = doctors.find((d) => d.id === item.doctorId);
              return (
                <AppointmentCard
                  doctorName={item.doctorName}
                  specialization={item.specialization}
                  avatarUri={doctor?.avatar}
                  date={formatDate(item.date)}
                  time={item.time}
                  hospital={item.hospital}
                  status={item.status as AppointmentStatus}
                  onPress={() => router.push(`/appointment/${item.id}`)}
                />
              );
            }}
          />
        )}
      </View>

      <View className="absolute bottom-8 right-5">
        <FloatingActionButton
          accessibilityLabel="Book appointment"
          onPress={() => router.push('/appointment/book')}
        />
      </View>
    </SafeAreaView>
  );
}
