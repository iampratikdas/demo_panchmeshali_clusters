import { router } from 'expo-router';
import { type ComponentType } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  BellIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  HeartIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from 'react-native-heroicons/outline';
import { ArrowRightOnRectangleIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, ProgressRing, SkeletonCard } from '@/components';
import { usePatient } from '@/hooks/useApi';
import { useAuthStore } from '@/store';
import { colors, shadows } from '@/theme';

interface PatientProfile {
  name: string;
  avatar: string;
  healthScore: number;
  bloodGroup: string;
  height: number;
  weight: number;
  bmi: number;
  age: number;
  conditions: string[];
  allergies: string[];
  lifestyle: {
    smoking?: boolean | string;
    alcohol?: string;
    exerciseFrequency?: string;
    exercise?: string;
    diet?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    validUntil: string;
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <Text className="text-sm font-semibold text-text-primary">{value}</Text>
    </View>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  onPress,
  danger,
}: {
  icon: ComponentType<{ color: string; size: number; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="min-h-14 flex-row items-center border-b border-border px-1 py-3"
    >
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-2xl"
        style={{ backgroundColor: danger ? colors.dangerMuted : colors.primaryMuted }}
      >
        <Icon
          color={danger ? colors.danger : colors.secondary}
          size={20}
          strokeWidth={2}
        />
      </View>
      <Text
        className={`flex-1 text-base font-medium ${
          danger ? 'text-danger' : 'text-text-primary'
        }`}
      >
        {label}
      </Text>
      {!danger ? (
        <ChevronRightIcon color={colors.textSecondary} size={20} strokeWidth={2} />
      ) : null}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { data: patient, isLoading } = usePatient();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  if (isLoading || !patient) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-5 pt-2">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={4} className="mt-4" showAvatar={false} />
        </View>
      </SafeAreaView>
    );
  }

  const profile = patient as unknown as PatientProfile;

  const exercise =
    profile.lifestyle.exerciseFrequency ?? profile.lifestyle.exercise ?? '—';
  const smoking =
    typeof profile.lifestyle.smoking === 'boolean'
      ? profile.lifestyle.smoking
        ? 'Yes'
        : 'No'
      : (profile.lifestyle.smoking ?? '—');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center px-5 pt-4">
          <Avatar uri={profile.avatar} name={profile.name} size="xl" />
          <Text className="mt-4 text-2xl font-bold text-text-primary">{profile.name}</Text>
          <View className="mt-5">
            <ProgressRing progress={profile.healthScore} size={100} strokeWidth={8} />
          </View>
          <Text className="mt-2 text-sm text-text-secondary">Health Score</Text>
        </View>

        <View className="mt-6 px-5">
          <Text className="mb-2 text-lg font-bold text-text-primary">Personal Details</Text>
          <View className="rounded-3xl bg-card px-5 py-1" style={shadows.soft}>
            <DetailRow label="Blood Group" value={profile.bloodGroup} />
            <View className="h-px bg-border" />
            <DetailRow label="Age" value={`${profile.age} years`} />
            <View className="h-px bg-border" />
            <DetailRow label="Height" value={`${profile.height} cm`} />
            <View className="h-px bg-border" />
            <DetailRow label="Weight" value={`${profile.weight} kg`} />
            <View className="h-px bg-border" />
            <DetailRow label="BMI" value={String(profile.bmi)} />
          </View>
        </View>

        {(profile.conditions?.length ?? 0) > 0 ? (
          <View className="mt-6 px-5">
            <Text className="mb-3 text-lg font-bold text-text-primary">Conditions</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.conditions.map((condition) => (
                <View key={condition} className="rounded-full bg-warningMuted px-4 py-2">
                  <Text className="text-sm font-semibold text-text-primary">{condition}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {(profile.allergies?.length ?? 0) > 0 ? (
          <View className="mt-6 px-5">
            <Text className="mb-3 text-lg font-bold text-text-primary">Allergies</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.allergies.map((allergy) => (
                <View key={allergy} className="rounded-full bg-dangerMuted px-4 py-2">
                  <Text className="text-sm font-semibold text-danger">{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mt-6 px-5">
          <Text className="mb-2 text-lg font-bold text-text-primary">Emergency Contact</Text>
          <View className="rounded-3xl bg-card px-5 py-4" style={shadows.soft}>
            <Text className="text-base font-semibold text-text-primary">
              {profile.emergencyContact.name}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              {profile.emergencyContact.relationship}
            </Text>
            <Text className="mt-2 text-sm font-medium text-secondary">
              {profile.emergencyContact.phone}
            </Text>
          </View>
        </View>

        <View className="mt-6 px-5">
          <Text className="mb-2 text-lg font-bold text-text-primary">Insurance</Text>
          <View className="rounded-3xl bg-card px-5 py-4" style={shadows.soft}>
            <Text className="text-base font-semibold text-text-primary">
              {profile.insurance.provider}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary">
              Policy {profile.insurance.policyNumber}
            </Text>
            <Text className="mt-2 text-xs text-text-secondary">
              Valid until {profile.insurance.validUntil}
            </Text>
          </View>
        </View>

        <View className="mt-6 px-5">
          <Text className="mb-2 text-lg font-bold text-text-primary">Lifestyle</Text>
          <View className="rounded-3xl bg-card px-5 py-1" style={shadows.soft}>
            <DetailRow label="Smoking" value={String(smoking)} />
            <View className="h-px bg-border" />
            <DetailRow label="Alcohol" value={profile.lifestyle.alcohol ?? '—'} />
            <View className="h-px bg-border" />
            <DetailRow label="Exercise" value={exercise} />
            <View className="h-px bg-border" />
            <DetailRow label="Diet" value={profile.lifestyle.diet ?? '—'} />
          </View>
        </View>

        <View className="mt-6 px-5">
          <Text className="mb-2 text-lg font-bold text-text-primary">Settings</Text>
          <View className="rounded-3xl bg-card px-4" style={shadows.soft}>
            <SettingsRow
              icon={BellIcon}
              label="Notifications"
              onPress={() => router.push('/notifications')}
            />
            <SettingsRow
              icon={ShieldCheckIcon}
              label="Privacy"
              onPress={() => {}}
            />
            <SettingsRow
              icon={GlobeAltIcon}
              label="Language"
              onPress={() => {}}
            />
            <SettingsRow
              icon={HeartIcon}
              label="Health Dashboard"
              onPress={() => router.push('/dashboard')}
            />
            <SettingsRow
              icon={PhoneIcon}
              label="Emergency"
              onPress={() => router.push('/emergency')}
            />
            <SettingsRow
              icon={ArrowRightOnRectangleIcon}
              label="Logout"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
