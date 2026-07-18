import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, SkeletonCard } from '@/components';
import { useChatThreads } from '@/hooks/useApi';
import { colors, shadows } from '@/theme';
import { formatRelative } from '@/utils/format';

interface ChatThreadItem {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  specialization: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatScreen() {
  const { data: threads, isLoading } = useChatThreads();

  const threadList = (threads ?? []) as unknown as ChatThreadItem[];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-5 pt-2">
          <SkeletonCard lines={1} showAvatar={false} />
          <SkeletonCard lines={2} className="mt-3" />
          <SkeletonCard lines={2} className="mt-3" />
          <SkeletonCard lines={2} className="mt-3" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-text-primary">Messages</Text>
        <Text className="mt-1 text-sm text-text-secondary">
          Chat with your doctors securely
        </Text>

        <View className="mt-5">
          {threadList.map((thread) => (
            <Pressable
              key={thread.id}
              onPress={() => router.push(`/chat/${thread.id}`)}
              className="mb-3 flex-row items-center rounded-3xl bg-card px-4 py-4"
              style={shadows.soft}
            >
              <Avatar
                uri={thread.doctorAvatar}
                name={thread.doctorName}
                size="lg"
                online={thread.isOnline}
              />

              <View className="ml-4 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-base font-bold text-text-primary" numberOfLines={1}>
                    {thread.doctorName}
                  </Text>
                  <Text className="ml-2 text-xs text-text-secondary">
                    {formatRelative(thread.lastMessageAt)}
                  </Text>
                </View>

                <Text className="mt-0.5 text-sm text-text-secondary" numberOfLines={1}>
                  {thread.specialization}
                </Text>

                <View className="mt-1.5 flex-row items-center justify-between">
                  <Text
                    className="flex-1 text-sm text-text-secondary"
                    numberOfLines={1}
                  >
                    {thread.lastMessage}
                  </Text>

                  {thread.unreadCount > 0 ? (
                    <View className="ml-2 min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-secondary px-1.5">
                      <Text className="text-xs font-bold text-white">
                        {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}

          {threadList.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-base font-semibold text-text-primary">No messages yet</Text>
              <Text className="mt-1 text-sm text-text-secondary">
                Start a conversation with your doctor
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
