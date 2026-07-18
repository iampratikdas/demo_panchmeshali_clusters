import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays, isSameDay } from 'date-fns';
import { ArrowLeftIcon, CalendarDaysIcon } from 'react-native-heroicons/outline';
import { Avatar, PrimaryButton } from '@/components';
import { SYMPTOM_CHIPS } from '@/constants';
import { useDoctors } from '@/hooks/useApi';
import { colors, shadows } from '@/theme';

const TIME_SLOTS = ['8:00 am', '10:00 am', '01:00 pm', '02:30 pm'];

export default function BookAppointmentScreen() {
  const { data: doctors = [] } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [symptoms, setSymptoms] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)),
    [],
  );

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  };

  const handleBook = () => {
    Alert.alert(
      'Appointment Booked',
      `Your appointment has been scheduled for ${format(selectedDay, 'MMM d, yyyy')} at ${selectedTime}.`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const isToday = isSameDay(selectedDay, new Date());

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
        <Text className="ml-3 text-xl font-bold text-text-primary">Book Appointment</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-3 text-base font-semibold text-text-primary">Select Doctor</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
        >
          {doctors.map((doctor) => {
            const selected = selectedDoctorId === doctor.id;
            return (
              <Pressable
                key={doctor.id}
                onPress={() => setSelectedDoctorId(doctor.id)}
                className="w-36 rounded-3xl bg-white p-4"
                style={[shadows.soft, selected && { borderWidth: 2, borderColor: colors.secondary }]}
              >
                <Avatar uri={doctor.avatar} name={doctor.name} size="md" online={doctor.isOnline} />
                <Text className="mt-3 text-sm font-bold text-text-primary" numberOfLines={1}>
                  {doctor.name}
                </Text>
                <Text className="mt-0.5 text-xs text-text-secondary" numberOfLines={1}>
                  {doctor.specialization}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mt-6 rounded-3xl bg-white p-5" style={shadows.soft}>
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primaryMuted">
              <CalendarDaysIcon color={colors.secondary} size={24} strokeWidth={2} />
            </View>
            <View className="ml-4">
              <Text className="text-sm font-medium text-text-secondary">
                {isToday ? 'Today' : format(selectedDay, 'EEEE')}
              </Text>
              <Text className="text-lg font-bold text-text-primary">
                {format(selectedDay, 'MMMM d, yyyy')}
              </Text>
            </View>
          </View>
        </View>

        <Text className="mb-3 mt-6 text-base font-semibold text-text-primary">Select Day</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {days.map((day) => {
            const selected = isSameDay(day, selectedDay);
            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => setSelectedDay(day)}
                className="min-w-[72px] items-center rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: selected ? colors.secondary : colors.white,
                  ...(selected ? {} : shadows.soft),
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: selected ? colors.white : colors.textSecondary }}
                >
                  {format(day, 'EEE')}
                </Text>
                <Text
                  className="mt-1 text-lg font-bold"
                  style={{ color: selected ? colors.white : colors.textPrimary }}
                >
                  {format(day, 'd')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text className="mb-3 mt-6 text-base font-semibold text-text-primary">Select Time</Text>
        <View className="flex-row flex-wrap gap-3">
          {TIME_SLOTS.map((time) => {
            const selected = selectedTime === time;
            return (
              <Pressable
                key={time}
                onPress={() => setSelectedTime(time)}
                className="rounded-full px-5 py-3"
                style={{
                  backgroundColor: selected ? colors.secondary : colors.white,
                  ...(selected ? {} : shadows.soft),
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: selected ? colors.white : colors.textPrimary }}
                >
                  {time}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 mt-6 text-base font-semibold text-text-primary">
          Describe your symptoms
        </Text>
        <TextInput
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Tell us how you're feeling..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="min-h-[100px] rounded-3xl border border-border bg-white p-4 text-base text-text-primary"
          style={shadows.soft}
        />

        <View className="mt-4 flex-row flex-wrap gap-2">
          {SYMPTOM_CHIPS.map((chip) => {
            const selected = selectedChips.includes(chip);
            return (
              <Pressable
                key={chip}
                onPress={() => toggleChip(chip)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: selected ? colors.primaryMuted : colors.white,
                  borderWidth: 1,
                  borderColor: selected ? colors.secondary : colors.border,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: selected ? colors.secondary : colors.textSecondary }}
                >
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-8">
          <PrimaryButton label="Book now" variant="full" showArrow onPress={handleBook} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
