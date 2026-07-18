import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { colors, shadows } from '@/theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  showHandle = true,
  showCloseButton = false,
}: BottomSheetProps) {
  const { height } = useWindowDimensions();
  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 280 });
      backdropOpacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(height, { duration: 240 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, height, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close bottom sheet"
            onPress={onClose}
            style={styles.flexFill}
          />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetStyle, shadows.medium]}>
          {showHandle ? (
            <View style={styles.handleWrap}>
              <View style={styles.handle} />
            </View>
          ) : null}

          {showCloseButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.closeButton}
            >
              <XMarkIcon color={colors.textSecondary} size={22} strokeWidth={2} />
            </Pressable>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  flexFill: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handleWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handle: {
    height: 6,
    width: 48,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
