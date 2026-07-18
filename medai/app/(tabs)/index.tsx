import { router } from 'expo-router';
import { useEffect, useMemo, type ComponentType } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {
  ArrowRightIcon,
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from 'react-native-heroicons/outline';
import {
  BeakerIcon,
  CalendarDaysIcon as CalendarSolid,
  ClockIcon,
  DocumentTextIcon,
  FolderIcon,
  PhoneIcon as PhoneSolid,
} from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppointmentCard,
  Avatar,
  MedicalCard,
  PrescriptionCard,
  ReportCard,
  SearchBar,
  SkeletonCard,
} from '@/components';
import { QUICK_ACTIONS } from '@/constants';
import {
  useActivity,
  useAppointments,
  useDoctors,
  useMedicines,
  usePatient,
  usePrescriptions,
  useReports,
} from '@/hooks/useApi';
import { colors, shadows } from '@/theme';
import { formatDate, formatRelative, getGreeting } from '@/utils/format';

const quickActionIcons: Record<string, ComponentType<{ color: string; size: number }>> = {
  document: DocumentTextIcon,
  folder: FolderIcon,
  pill: BeakerIcon,
  calendar: CalendarSolid,
  phone: PhoneSolid,
  clock: ClockIcon,
};

function MetricChip({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="min-w-[30%] flex-1 rounded-2xl bg-background px-4 py-3">
      <Text className="text-xs font-medium text-text-secondary">{label}</Text>
      <Text className="mt-1 text-base font-bold text-text-primary">{value}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-bold text-text-primary">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="min-h-12 flex-row items-center">
          <Text className="text-sm font-semibold text-secondary">{actionLabel}</Text>
          <ChevronRightIcon color={colors.secondary} size={16} strokeWidth={2.5} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const { data: patient, isLoading: patientLoading } = usePatient();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: medicines, isLoading: medicinesLoading } = useMedicines();
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePrescriptions();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: doctors } = useDoctors();
  const { data: activity } = useActivity();

  const fadeOpacity = useSharedValue(0);
  const fadeTranslateY = useSharedValue(16);

  useEffect(() => {
    fadeOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    fadeTranslateY.value = withDelay(100, withTiming(0, { duration: 500 }));
  }, [fadeOpacity, fadeTranslateY]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
    transform: [{ translateY: fadeTranslateY.value }],
  }));

  const isLoading =
    patientLoading ||
    appointmentsLoading ||
    medicinesLoading ||
    prescriptionsLoading ||
    reportsLoading;

  const upcomingAppointment = useMemo(
    () => appointments?.find((a) => a.status === 'upcoming'),
    [appointments],
  );

  const appointmentDoctor = useMemo(
    () => doctors?.find((d) => d.id === upcomingAppointment?.doctorId),
    [doctors, upcomingAppointment],
  );

  const recentPrescription = prescriptions?.[0];
  const recentReport = reports?.[0];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-5 pt-2">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={4} className="mt-4" />
          <SkeletonCard lines={3} className="mt-4" showAvatar={false} />
        </View>
      </SafeAreaView>
    );
  }

  const patientData = patient as {
    firstName?: string;
    name?: string;
    avatar?: string;
    bloodGroup?: string;
    height?: number;
    weight?: number;
    bmi?: number;
    age?: number;
    conditions?: string[];
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Animated.View style={[{ flex: 1 }, fadeStyle]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between px-5 pt-2">
            <View className="flex-1">
              <Text className="text-sm text-text-secondary">{getGreeting()}</Text>
              <Text className="text-2xl font-bold text-text-primary">
                {patientData?.firstName ?? patientData?.name?.split(' ')[0] ?? 'there'}
              </Text>
            </View>
            <Avatar uri={patientData?.avatar} name={patientData?.name} size="md" />
            <Pressable
              onPress={() => router.push('/notifications')}
              className="ml-3 h-11 w-11 items-center justify-center rounded-full bg-card"
              style={shadows.soft}
            >
              <BellIcon color={colors.textPrimary} size={22} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/search')}
              className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-card"
              style={shadows.soft}
            >
              <MagnifyingGlassIcon color={colors.textPrimary} size={22} strokeWidth={2} />
            </Pressable>
          </View>

          <View className="mt-5 px-5">
            <Pressable onPress={() => router.push('/search')}>
              <SearchBar
                value=""
                onChangeText={() => {}}
                editable={false}
                placeholder="Search doctors, medicines, records..."
              />
            </Pressable>
          </View>

          <View className="mt-5 px-5">
            <Pressable
              onPress={() => router.push('/emergency')}
              className="flex-row items-center rounded-3xl bg-dangerMuted px-5 py-4"
              style={shadows.soft}
            >
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-danger">
                <PhoneIcon color={colors.white} size={22} strokeWidth={2} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-bold text-text-primary">Emergency Call</Text>
                <Text className="mt-0.5 text-sm text-text-secondary">
                  Tap for quick access to emergency contacts
                </Text>
              </View>
              <ArrowRightIcon color={colors.danger} size={20} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View className="mt-6 px-5">
            <SectionHeader title="Upcoming Appointment" />
            {upcomingAppointment ? (
              <AppointmentCard
                doctorName={upcomingAppointment.doctorName}
                specialization={upcomingAppointment.specialization}
                avatarUri={appointmentDoctor?.avatar}
                date={formatDate(upcomingAppointment.date, 'MMM d, yyyy')}
                time={upcomingAppointment.time}
                hospital={upcomingAppointment.hospital}
                status={upcomingAppointment.status as 'upcoming' | 'completed' | 'cancelled'}
                onPress={() => router.push(`/appointment/${upcomingAppointment.id}`)}
              />
            ) : (
              <MedicalCard>
                <Text className="text-sm text-text-secondary">No upcoming appointments</Text>
              </MedicalCard>
            )}
          </View>

          <View className="mt-6 px-5">
            <SectionHeader
              title="Today's Medicines"
              actionLabel="View all"
              onAction={() => router.push('/(tabs)/medicines')}
            />
            <MedicalCard>
              {medicines && medicines.length > 0 ? (
                medicines.slice(0, 4).map((med, index) => {
                  const medData = med as {
                    id: string;
                    name: string;
                    dosage?: string;
                    timings?: string[];
                    completedToday?: string[];
                  };
                  return (
                    <View
                      key={medData.id}
                      className={`flex-row items-center justify-between ${
                        index > 0 ? 'mt-4 border-t border-border pt-4' : ''
                      }`}
                    >
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-text-primary">
                          {medData.name}
                        </Text>
                        <Text className="mt-0.5 text-sm text-text-secondary">
                          {medData.dosage ?? ''}
                        </Text>
                        <View className="mt-2 flex-row flex-wrap gap-1.5">
                          {(medData.timings ?? []).map((timing) => {
                            const taken = medData.completedToday?.includes(timing);
                            return (
                              <View
                                key={timing}
                                className={`rounded-full px-2.5 py-1 ${
                                  taken ? 'bg-secondaryMuted' : 'bg-primaryMuted'
                                }`}
                              >
                                <Text
                                  className={`text-xs font-semibold capitalize ${
                                    taken ? 'text-secondary' : 'text-text-primary'
                                  }`}
                                >
                                  {timing}
                                  {taken ? ' ✓' : ''}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                      <Pressable
                        onPress={() => router.push(`/medicine/${medData.id}`)}
                        hitSlop={8}
                      >
                        <ChevronRightIcon color={colors.textSecondary} size={20} />
                      </Pressable>
                    </View>
                  );
                })
              ) : (
                <Text className="text-sm text-text-secondary">No medicines scheduled</Text>
              )}
            </MedicalCard>
          </View>

          <View className="mt-6 px-5">
            <SectionHeader title="Health Summary" />
            <View className="flex-row flex-wrap gap-2">
              <MetricChip label="Blood Group" value={patientData?.bloodGroup ?? '—'} />
              <MetricChip label="Height" value={`${patientData?.height ?? '—'} cm`} />
              <MetricChip label="Weight" value={`${patientData?.weight ?? '—'} kg`} />
              <MetricChip label="BMI" value={patientData?.bmi ?? '—'} />
              <MetricChip label="Age" value={patientData?.age ?? '—'} />
            </View>
          </View>

          {(patientData?.conditions?.length ?? 0) > 0 ? (
            <View className="mt-6 px-5">
              <SectionHeader title="Medical Conditions" />
              <View className="flex-row flex-wrap gap-2">
                {patientData!.conditions!.map((condition) => (
                  <View
                    key={condition}
                    className="rounded-full bg-warningMuted px-4 py-2"
                  >
                    <Text className="text-sm font-semibold text-text-primary">{condition}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {recentPrescription ? (
            <View className="mt-6 px-5">
              <SectionHeader title="Recent Prescription" />
              <PrescriptionCard
                doctorName={recentPrescription.doctorName}
                hospital={recentPrescription.verifiedBy ?? recentPrescription.pharmacy ?? ''}
                date={formatDate(recentPrescription.issuedDate)}
                medicineCount={
                  recentPrescription.medicines?.length ??
                  recentPrescription.medicineIds?.length ??
                  0
                }
                status={recentPrescription.status as 'verified' | 'pending' | 'expired'}
                onPress={() => router.push(`/prescription/${recentPrescription.id}`)}
              />
            </View>
          ) : null}

          {recentReport ? (
            <View className="mt-6 px-5">
              <SectionHeader title="Recent Report" />
              <ReportCard
                type={recentReport.type as 'Blood Test' | 'MRI' | 'CT Scan' | 'X-Ray' | 'Ultrasound' | 'ECG' | 'Other'}
                date={formatDate(recentReport.date)}
                doctorName={recentReport.doctorName}
                hospital={recentReport.hospital}
                status={recentReport.status as 'ready' | 'processing'}
                onPress={() => router.push(`/reports/${recentReport.id}`)}
              />
            </View>
          ) : null}

          <View className="mt-6 px-5">
            <SectionHeader title="Quick Actions" />
            <View className="flex-row flex-wrap gap-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = quickActionIcons[action.icon] ?? DocumentTextIcon;
                return (
                  <Pressable
                    key={action.id}
                    onPress={() => router.push(action.route as never)}
                    className="w-[47%] rounded-3xl bg-card p-4"
                    style={shadows.soft}
                  >
                    <View
                      className="mb-3 h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: colors.primaryMuted }}
                    >
                      <Icon color={colors.secondary} size={22} />
                    </View>
                    <Text className="text-sm font-semibold text-text-primary">{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-6 px-5">
            <SectionHeader title="Recent Activity" />
            <MedicalCard className="gap-0 p-0 overflow-hidden">
              {(activity ?? []).slice(0, 5).map((item, index) => {
                const act = item as {
                  id: string;
                  title: string;
                  description: string;
                  timestamp: string;
                  icon: string;
                  color: string;
                };
                return (
                  <View
                    key={act.id}
                    className={`flex-row items-start px-5 py-4 ${
                      index > 0 ? 'border-t border-border' : ''
                    }`}
                  >
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${act.color}22` }}
                    >
                      <Text className="text-lg">{act.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary">{act.title}</Text>
                      <Text className="mt-0.5 text-xs text-text-secondary">{act.description}</Text>
                      <Text className="mt-1 text-xs text-text-secondary">
                        {formatRelative(act.timestamp)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </MedicalCard>
          </View>

          <View className="mt-6 px-5">
            <Pressable
              onPress={() => router.push('/dashboard')}
              className="flex-row items-center justify-between rounded-3xl bg-secondaryMuted px-5 py-4"
            >
              <View className="flex-row items-center">
                <CalendarDaysIcon color={colors.secondary} size={22} strokeWidth={2} />
                <View className="ml-3">
                  <Text className="text-base font-bold text-text-primary">Full Health Dashboard</Text>
                  <Text className="text-sm text-text-secondary">
                    View trends, metrics, and insights
                  </Text>
                </View>
              </View>
              <ChevronRightIcon color={colors.secondary} size={20} strokeWidth={2.5} />
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
