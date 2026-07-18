import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedicalHero, PrimaryButton } from '@/components';
import { APP_NAME, APP_TAGLINE } from '@/constants';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

function FloatingCircle({
  size,
  top,
  left,
  right,
  bottom,
  opacity,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity: number;
}) {
  return (
    <View
      pointerEvents="none"
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        backgroundColor: colors.primary,
        opacity,
      }}
    />
  );
}

export default function SplashScreen() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(24);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(32);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(40);

  useEffect(() => {
    heroOpacity.value = withTiming(1, { duration: 700 });
    heroTranslateY.value = withSpring(0, { damping: 18, stiffness: 120 });

    contentOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    contentTranslateY.value = withDelay(200, withSpring(0, { damping: 18, stiffness: 120 }));

    buttonOpacity.value = withDelay(450, withTiming(1, { duration: 600 }));
    buttonTranslateY.value = withDelay(450, withSpring(0, { damping: 16, stiffness: 110 }));
  }, [heroOpacity, heroTranslateY, contentOpacity, contentTranslateY, buttonOpacity, buttonTranslateY]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const handleGetStarted = () => {
    completeOnboarding();
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <FloatingCircle size={120} top={-20} right={-30} opacity={0.18} />
      <FloatingCircle size={80} top={140} left={-24} opacity={0.12} />
      <FloatingCircle size={56} bottom={180} right={32} opacity={0.15} />
      <FloatingCircle size={40} bottom={100} left={48} opacity={0.1} />

      <View className="flex-1 items-center justify-center px-8">
        <Animated.View style={[{ alignItems: 'center' }, heroStyle]}>
          <MedicalHero width={260} height={260} />
        </Animated.View>

        <Animated.View style={[{ marginTop: 24, alignItems: 'center' }, contentStyle]}>
          <Text className="text-4xl font-bold tracking-tight text-text-primary">{APP_NAME}</Text>
          <Text className="mt-2 text-lg font-semibold text-secondary">{APP_TAGLINE}</Text>
          <Text className="mt-4 text-center text-base leading-6 text-text-secondary">
            Whether at home, at work, or on the go — keep your health records, medicines, and
            appointments organized in one calm, secure place.
          </Text>
        </Animated.View>

        <Animated.View style={[{ marginTop: 40, width: '100%' }, buttonStyle]}>
          <PrimaryButton
            label="Get started"
            showArrow
            variant="full"
            onPress={handleGetStarted}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
