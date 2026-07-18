import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components';
import { BLOOD_GROUPS, GENDERS } from '@/constants';
import { api } from '@/services/api';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';
import { signupSchema, type SignupForm } from '@/utils/validation';

function ChipSelector({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <View className="mt-5">
      <Text className="mb-3 text-sm font-semibold text-text-primary">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className="rounded-full px-4 py-2.5"
              style={{
                backgroundColor: selected ? colors.secondary : colors.card,
                borderWidth: selected ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: selected ? colors.white : colors.textPrimary }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text className="mt-1.5 text-sm text-danger">{error}</Text> : null}
    </View>
  );
}

export default function SignupScreen() {
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      dob: '',
      gender: '',
      bloodGroup: '',
      mobile: '',
      email: '',
      password: '',
    },
  });

  const gender = watch('gender');
  const bloodGroup = watch('bloodGroup');

  const onSubmit = async (data: SignupForm) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.signup(data);
      login(true);
      router.replace('/(tabs)');
    } catch {
      setError('Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          className="mb-4 min-h-12 w-12 items-center justify-center rounded-full bg-card"
          hitSlop={8}
        >
          <ChevronLeftIcon color={colors.textPrimary} size={22} strokeWidth={2} />
        </Pressable>

        <Text className="text-3xl font-bold text-text-primary">Create account</Text>
        <Text className="mt-2 text-base text-text-secondary">
          Set up your MedAI profile to get started
        </Text>

        <View className="mt-8">
          <Text className="mb-2 text-sm font-semibold text-text-primary">Full name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.name ? (
            <Text className="mt-1.5 text-sm text-danger">{errors.name.message}</Text>
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-sm font-semibold text-text-primary">Date of birth</Text>
          <Controller
            control={control}
            name="dob"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.dob ? (
            <Text className="mt-1.5 text-sm text-danger">{errors.dob.message}</Text>
          ) : null}
        </View>

        <ChipSelector
          label="Gender"
          options={GENDERS}
          value={gender}
          onChange={(val) => setValue('gender', val, { shouldValidate: true })}
          error={errors.gender?.message}
        />

        <ChipSelector
          label="Blood group"
          options={BLOOD_GROUPS}
          value={bloodGroup}
          onChange={(val) => setValue('bloodGroup', val, { shouldValidate: true })}
          error={errors.bloodGroup?.message}
        />

        <View className="mt-5">
          <Text className="mb-2 text-sm font-semibold text-text-primary">Mobile</Text>
          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="+1 555 000 0000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.mobile ? (
            <Text className="mt-1.5 text-sm text-danger">{errors.mobile.message}</Text>
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-sm font-semibold text-text-primary">Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="you@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.email ? (
            <Text className="mt-1.5 text-sm text-danger">{errors.email.message}</Text>
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-sm font-semibold text-text-primary">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.password ? (
            <Text className="mt-1.5 text-sm text-danger">{errors.password.message}</Text>
          ) : null}
        </View>

        {error ? <Text className="mt-4 text-sm text-danger">{error}</Text> : null}

        <View className="mt-8">
          <PrimaryButton
            label="Create Account"
            variant="full"
            showArrow
            loading={submitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm text-text-secondary">Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
            <Text className="text-sm font-semibold text-secondary">Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
