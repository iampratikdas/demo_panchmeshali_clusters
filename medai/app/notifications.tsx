import { Pressable, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BeakerIcon,
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
} from 'react-native-heroicons/outline';
import { useNotifications } from '@/hooks/useApi';
import { groupByDateLabel, formatRelative } from '@/utils/format';
import { colors, shadows } from '@/theme';
import type { NotificationType } from '@/types';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const TYPE_ICONS: Record<NotificationType, typeof BeakerIcon> = {
  medicine: BeakerIcon,
  appointment: CalendarDaysIcon,
  prescription: DocumentTextIcon,
  message: ChatBubbleLeftIcon,
  report: DocumentTextIcon,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  medicine: colors.secondaryMuted,
  appointment: colors.primaryMuted,
  prescription: colors.warningMuted,
  message: colors.secondaryMuted,
  report: colors.primaryMuted,
};

export default function NotificationsScreen() {
  const { data: notifications = [] } = useNotifications();

  const items = notifications.map((n) => ({
    ...n,
    message: n.message ?? '',
  })) as NotificationItem[];

  const groups = groupByDateLabel(items);

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
        <Text className="ml-3 text-xl font-bold text-text-primary">Notifications</Text>
      </View>

      <FlashList
        data={groups}
        keyExtractor={([label]) => label}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        renderItem={({ item: [label, groupItems] }) => (
          <View className="mb-6">
            <Text className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">
              {label}
            </Text>
            {groupItems.map((notification) => {
              const Icon = TYPE_ICONS[notification.type];
              return (
                <Pressable
                  key={notification.id}
                  className="mb-3 flex-row rounded-3xl bg-white p-4"
                  style={shadows.soft}
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: TYPE_COLORS[notification.type] }}
                  >
                    <Icon color={colors.secondary} size={22} strokeWidth={2} />
                  </View>
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center">
                      <Text className="flex-1 text-base font-bold text-text-primary">
                        {notification.title}
                      </Text>
                      {!notification.read ? (
                        <View className="ml-2 h-2.5 w-2.5 rounded-full bg-secondary" />
                      ) : null}
                    </View>
                    <Text className="mt-1 text-sm leading-5 text-text-secondary">
                      {notification.message}
                    </Text>
                    <Text className="mt-2 text-xs text-text-secondary">
                      {formatRelative(notification.timestamp)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <BellIcon color={colors.textSecondary} size={40} strokeWidth={1.5} />
            <Text className="mt-4 text-base font-semibold text-text-primary">
              No notifications
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
