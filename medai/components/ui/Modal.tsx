import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
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

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  visible,
  onClose,
  title,
  description,
  children,
  showCloseButton = true,
}: ModalProps) {
  const { width } = useWindowDimensions();
  const scale = useSharedValue(0.94);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, { duration: 220 });
      opacity.value = withTiming(1, { duration: 220 });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.94, { duration: 180 });
      opacity.value = withTiming(0, { duration: 180 });
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, scale, opacity, backdropOpacity]);

  const dialogStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
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
            accessibilityLabel="Close modal"
            onPress={onClose}
            style={styles.flexFill}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.dialog,
            dialogStyle,
            shadows.medium,
            { maxWidth: width - 48 },
          ]}
        >
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

          {title ? <Text style={styles.title}>{title}</Text> : null}

          {description ? <Text style={styles.description}>{description}</Text> : null}

          {children ? (
            <View style={title || description ? styles.contentSpacing : undefined}>
              {children}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  flexFill: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  dialog: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: colors.card,
    padding: 24,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    paddingRight: 40,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  contentSpacing: {
    marginTop: 20,
  },
});
