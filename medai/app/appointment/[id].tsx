import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
} from 'react-native-heroicons/outline';
import {
  Avatar,
  PrimaryButton,
  StatusBadge,
} from '@/components';
import { useAppointment, useDoctor } from '@/hooks/useApi';
import { formatDate } from '@/utils/format';
import type { AppointmentStatus } from '@/types';
import { colors, shadows } from '@/theme';

const statusMap: Record<AppointmentStatus, 'upcoming' | 'completed' | 'cancelled'> = {
  upcoming: 'upcoming',
  completed: 'completed',
  cancelled: 'cancelled',
};

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: appointment, isLoading } = useAppointment(id ?? '');
  const { data: doctor } = useDoctor(appointment?.doctorId ?? '');

  if (isLoading || !appointment) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.secondary} size="large" />
      </SafeAreaView>
    );
  }

  const reason =
    (appointment as { reason?: string; symptoms?: string }).reason ??
    (appointment as { symptoms?: string }).symptoms ??
    '';
  const recommendation =
    (appointment as { recommendation?: string }).recommendation ?? appointment.notes;

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
        <Text className="ml-3 text-xl font-bold text-text-primary">Appointment Details</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl bg-white p-5" style={shadows.soft}>
          <View className="flex-row items-center">
            <Avatar uri={doctor?.avatar} name={appointment.doctorName} size="lg" />
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-text-primary">{appointment.doctorName}</Text>
              <Text className="mt-0.5 text-sm text-text-secondary">
                {(appointment as { specialization?: string }).specialization ??
                  doctor?.specialization}
              </Text>
              <View className="mt-2">
                <StatusBadge status={statusMap[appointment.status as AppointmentStatus]} />
              </View>
            </View>
          </View>

          <View className="mt-5 rounded-2xl bg-background px-4 py-4">
            <View className="flex-row items-center">
              <CalendarDaysIcon color={colors.secondary} size={20} strokeWidth={2} />
              <Text className="ml-3 text-base font-medium text-text-primary">
                {formatDate(appointment.date, 'EEEE, MMM d, yyyy')}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center">
              <ClockIcon color={colors.secondary} size={20} strokeWidth={2} />
              <Text className="ml-3 text-base font-medium text-text-primary">{appointment.time}</Text>
            </View>
            <View className="mt-3 flex-row items-center">
              <BuildingOffice2Icon color={colors.textSecondary} size={20} strokeWidth={2} />
              <Text className="ml-3 flex-1 text-base text-text-secondary">{appointment.hospital}</Text>
            </View>
            <View className="mt-3 flex-row items-start">
              <MapPinIcon color={colors.textSecondary} size={20} strokeWidth={2} />
              <Text className="ml-3 flex-1 text-sm text-text-secondary">
                {(appointment as { mode?: string }).mode === 'video'
                  ? 'Video consultation'
                  : 'In-person visit'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <Text className="text-base font-bold text-text-primary">Symptoms / Reason</Text>
          <Text className="mt-2 text-sm leading-6 text-text-secondary">{reason}</Text>
        </View>

        {appointment.notes ? (
          <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
            <Text className="text-base font-bold text-text-primary">Notes</Text>
            <Text className="mt-2 text-sm leading-6 text-text-secondary">{appointment.notes}</Text>
          </View>
        ) : null}

        <View className="mt-5 rounded-3xl bg-white p-5" style={shadows.soft}>
          <Text className="text-base font-bold text-text-primary">Recommendation</Text>
          <Text className="mt-2 text-sm leading-6 text-text-secondary">{recommendation}</Text>
        </View>

        <View className="mt-6">
          <PrimaryButton
            label="Book again"
            variant="full"
            onPress={() => router.push('/appointment/book')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
