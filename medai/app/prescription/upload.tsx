import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
} from 'react-native-heroicons/outline';
import { PrescriptionCard, PrimaryButton, StatusBadge } from '@/components';
import { colors, shadows } from '@/theme';
import type { PrescriptionStatus } from '@/types';

const DUMMY_PRESCRIPTION = {
  doctorName: 'Dr. Sandra Perry',
  hospital: 'Springfield General Hospital',
  date: 'Jul 17, 2026',
  medicineCount: 2,
  status: 'verified' as PrescriptionStatus,
};

export default function PrescriptionUploadScreen() {
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = () => {
    setUploaded(true);
    Alert.alert('Upload Complete', 'Your prescription has been uploaded successfully.');
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
        <Text className="ml-3 text-xl font-bold text-text-primary">Upload Prescription</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-2 text-2xl font-bold text-text-primary">
          Upload your prescription
        </Text>
        <Text className="mb-6 text-sm leading-5 text-text-secondary">
          Take a clear photo or upload a PDF of your prescription. Our team will verify it within
          24 hours.
        </Text>

        <Pressable
          onPress={handleUpload}
          className="items-center justify-center rounded-3xl border-2 border-dashed border-secondary bg-white py-14"
          style={shadows.soft}
        >
          <View className="h-20 w-20 items-center justify-center rounded-full bg-primaryMuted">
            <CloudArrowUpIcon color={colors.secondary} size={40} strokeWidth={1.5} />
          </View>
          <Text className="mt-4 text-base font-semibold text-text-primary">
            Tap to upload prescription
          </Text>
          <Text className="mt-1 text-sm text-text-secondary">PNG, JPG or PDF up to 10MB</Text>
        </Pressable>

        <View className="mt-6">
          <PrimaryButton
            label="Upload"
            variant="full"
            showArrow={false}
            onPress={handleUpload}
          />
        </View>

        {uploaded ? (
          <View className="mt-8">
            <Text className="mb-3 text-base font-semibold text-text-primary">Preview</Text>

            <View
              className="mb-5 h-48 items-center justify-center rounded-3xl bg-background"
              style={shadows.soft}
            >
              <DocumentTextIcon color={colors.textSecondary} size={48} strokeWidth={1.5} />
              <Text className="mt-3 text-sm font-medium text-text-secondary">
                prescription_scan.pdf
              </Text>
              <View className="mt-3">
                <StatusBadge status="verified" />
              </View>
            </View>

            <PrescriptionCard
              doctorName={DUMMY_PRESCRIPTION.doctorName}
              hospital={DUMMY_PRESCRIPTION.hospital}
              date={DUMMY_PRESCRIPTION.date}
              medicineCount={DUMMY_PRESCRIPTION.medicineCount}
              status={DUMMY_PRESCRIPTION.status}
              onPress={() => router.push('/prescription/rx1')}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
