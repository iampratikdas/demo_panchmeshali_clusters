import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CheckIcon } from 'react-native-heroicons/solid';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OutlineButton, PrimaryButton, SecondaryButton } from '@/components';
import { api } from '@/services/api';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';
import { loginSchema, type LoginForm } from '@/utils/validation';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.login(data.email, data.password);
      login(data.rememberMe ?? true);
      router.replace('/(tabs)');
    } catch {
      setError('Unable to sign in. Please check your credentials and try again.');
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
        contentContainerClassName="px-6 pb-10 pt-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Welcome back
        </Text>
        <Text className="mt-2 text-base" style={{ color: colors.textSecondary }}>
          Sign in to continue
        </Text>

        <View className="mt-8">
          <Text className="mb-2 text-sm font-semibold" style={{ color: colors.textPrimary }}>
            Email
          </Text>
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
                autoCorrect={false}
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.email ? (
            <Text className="mt-1.5 text-sm" style={{ color: colors.danger }}>
              {errors.email.message}
            </Text>
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-sm font-semibold" style={{ color: colors.textPrimary }}>
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                className="min-h-14 rounded-3xl px-5 text-base"
                style={inputStyle}
              />
            )}
          />
          {errors.password ? (
            <Text className="mt-1.5 text-sm" style={{ color: colors.danger }}>
              {errors.password.message}
            </Text>
          ) : null}
        </View>

        <Controller
          control={control}
          name="rememberMe"
          render={({ field: { value, onChange } }) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: value }}
              onPress={() => onChange(!value)}
              className="mt-5 min-h-12 flex-row items-center"
            >
              <View
                className="mr-3 h-6 w-6 items-center justify-center rounded-md"
                style={{
                  borderWidth: 1,
                  borderColor: value ? colors.secondary : colors.border,
                  backgroundColor: value ? colors.secondary : colors.card,
                }}
              >
                {value ? <CheckIcon color={colors.white} size={14} /> : null}
              </View>
              <Text className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                Remember me
              </Text>
            </Pressable>
          )}
        />

        {error ? (
          <Text className="mt-4 text-sm" style={{ color: colors.danger }}>
            {error}
          </Text>
        ) : null}

        <View className="mt-6">
          <PrimaryButton
            label="Continue"
            variant="full"
            showArrow
            loading={submitting}
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        <View className="my-8 flex-row items-center">
          <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
          <Text className="mx-4 text-sm" style={{ color: colors.textSecondary }}>
            or
          </Text>
          <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
        </View>

        <OutlineButton label="Continue with Google" fullWidth onPress={() => {}} />
        <View className="mt-3">
          <OutlineButton label="Continue with Apple" fullWidth onPress={() => {}} />
        </View>

        <View className="mt-4">
          <SecondaryButton label="Sign in with Face ID" fullWidth onPress={() => {}} />
        </View>

        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            Don&apos;t have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
            <Text className="text-sm font-semibold" style={{ color: colors.secondary }}>
              Sign up
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
