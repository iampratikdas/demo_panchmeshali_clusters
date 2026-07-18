import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BuildingOffice2Icon,
  HeartIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { useEmergencyContacts, usePatient } from '@/hooks/useApi';
import { colors, shadows } from '@/theme';

type ContactType = 'hospital' | 'family' | 'ambulance' | 'primary_doctor';

const CONTACT_CONFIG: Record<
  ContactType,
  { icon: typeof PhoneIcon; bg: string; accent: string; label: string }
> = {
  hospital: {
    icon: BuildingOffice2Icon,
    bg: colors.dangerMuted,
    accent: colors.danger,
    label: 'Hospital',
  },
  family: {
    icon: UserIcon,
    bg: colors.primaryMuted,
    accent: colors.secondary,
    label: 'Family',
  },
  ambulance: {
    icon: TruckIcon,
    bg: colors.dangerMuted,
    accent: colors.danger,
    label: 'Ambulance',
  },
  primary_doctor: {
    icon: HeartIcon,
    bg: colors.secondaryMuted,
    accent: colors.secondary,
    label: 'Primary Doctor',
  },
};

function handleCall(phone: string) {
  Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
}

export default function EmergencyScreen() {
  const { data: contacts = [] } = useEmergencyContacts();
  const { data: patient } = usePatient();

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
          <Text className="text-xl font-bold text-text-primary">Emergency</Text>
          <Text className="text-sm text-text-secondary">Quick access when you need help</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="mb-6 rounded-3xl border border-danger/20 bg-white p-5"
          style={shadows.soft}
        >
          <Text className="text-base font-bold text-danger">In case of emergency</Text>
          <Text className="mt-1 text-sm leading-5 text-text-secondary">
            Tap any contact below to call immediately. For life-threatening situations, call 911
            first.
          </Text>
        </View>

        <Text className="mb-3 text-base font-bold text-text-primary">Emergency Contacts</Text>

        {contacts.map((contact) => {
          const type = contact.type as ContactType;
          const config = CONTACT_CONFIG[type] ?? CONTACT_CONFIG.family;
          const Icon = config.icon;
          const relationship =
            (contact as { relationship?: string; notes?: string }).relationship ??
            (contact as { notes?: string }).notes;

          return (
            <View
              key={contact.id}
              className="mb-4 rounded-3xl bg-white p-5"
              style={shadows.soft}
            >
              <View className="flex-row items-start">
                <View
                  className="h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: config.bg }}
                >
                  <Icon color={config.accent} size={26} strokeWidth={2} />
                </View>

                <View className="ml-4 flex-1">
                  <Text className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {config.label}
                  </Text>
                  <Text className="mt-0.5 text-lg font-bold text-text-primary">{contact.name}</Text>
                  {relationship ? (
                    <Text className="mt-0.5 text-sm text-text-secondary">{relationship}</Text>
                  ) : null}
                  {(contact as { notes?: string }).notes && type !== 'family' ? (
                    <Text className="mt-1 text-xs text-text-secondary">
                      {(contact as { notes: string }).notes}
                    </Text>
                  ) : null}
                </View>
              </View>

              <Pressable
                onPress={() => handleCall(contact.phone)}
                className="mt-4 flex-row items-center justify-center rounded-full py-3.5"
                style={{ backgroundColor: config.accent }}
              >
                <PhoneIcon color={colors.white} size={20} strokeWidth={2} />
                <Text className="ml-2 text-base font-bold text-white">{contact.phone}</Text>
              </Pressable>
            </View>
          );
        })}

        <Text className="mb-3 mt-4 text-base font-bold text-text-primary">Medical ID Card</Text>

        <View className="rounded-3xl bg-white p-5" style={shadows.soft}>
          <View className="flex-row">
            <View className="h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background">
              <View className="h-16 w-16 rounded-lg border-2 border-text-primary">
                <View className="flex-1 flex-row flex-wrap">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <View
                      key={i}
                      className="h-1/4 w-1/4"
                      style={{
                        backgroundColor: i % 3 === 0 ? colors.textPrimary : 'transparent',
                      }}
                    />
                  ))}
                </View>
              </View>
              <Text className="mt-2 text-[10px] text-text-secondary">QR Code</Text>
            </View>

            <View className="ml-5 flex-1">
              {patient ? (
                <>
                  <Text className="text-lg font-bold text-text-primary">{patient.name}</Text>
                  <View className="mt-3 rounded-2xl bg-dangerMuted px-3 py-2">
                    <Text className="text-xs text-text-secondary">Blood Group</Text>
                    <Text className="text-xl font-bold text-danger">{patient.bloodGroup}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>

          {patient ? (
            <>
              <View className="mt-5">
                <Text className="mb-2 text-sm font-semibold text-text-primary">Allergies</Text>
                <View className="flex-row flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <View key={allergy} className="rounded-full bg-dangerMuted px-3 py-1.5">
                      <Text className="text-xs font-semibold text-danger">{allergy}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="mt-4">
                <Text className="mb-2 text-sm font-semibold text-text-primary">Conditions</Text>
                <View className="flex-row flex-wrap gap-2">
                  {patient.conditions.map((condition) => (
                    <View key={condition} className="rounded-full bg-warningMuted px-3 py-1.5">
                      <Text className="text-xs font-semibold text-warning">{condition}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
