import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  PhotoIcon,
} from 'react-native-heroicons/outline';
import { BeakerIcon, DocumentChartBarIcon } from 'react-native-heroicons/solid';
import { Avatar, BottomSheet } from '@/components';
import {
  useChatMessages,
  useChatThreads,
  useMedicines,
  usePatient,
  useReports,
} from '@/hooks/useApi';
import { formatDate, formatRelative } from '@/utils/format';
import { colors, shadows } from '@/theme';
import type { MessageType } from '@/types';

type ChatMessage = {
  id: string;
  chatId: string;
  senderType: 'patient' | 'doctor';
  type: MessageType;
  content: string;
  timestamp: string;
  attachmentName?: string;
  duration?: number | string;
  mediaUrl?: string;
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const isPatient = message.senderType === 'patient';

  const bubbleContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <View>
            <View className="h-36 items-center justify-center rounded-2xl bg-background">
              <PhotoIcon color={colors.textSecondary} size={32} strokeWidth={1.5} />
              <Text className="mt-2 text-xs text-text-secondary">Image attachment</Text>
            </View>
            {message.content ? (
              <Text
                className={`mt-2 text-sm leading-5 ${isPatient ? 'text-white/90' : 'text-text-secondary'}`}
              >
                {message.content}
              </Text>
            ) : null}
          </View>
        );

      case 'voice':
        return (
          <View className="flex-row items-center">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: isPatient ? 'rgba(255,255,255,0.2)' : colors.primaryMuted }}
            >
              <MicrophoneIcon
                color={isPatient ? colors.white : colors.secondary}
                size={20}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-end gap-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <View
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      height: 8 + (i % 4) * 6,
                      backgroundColor: isPatient ? colors.white : colors.secondary,
                      opacity: 0.7,
                    }}
                  />
                ))}
              </View>
              <Text
                className={`mt-1 text-xs ${isPatient ? 'text-white/70' : 'text-text-secondary'}`}
              >
                {message.duration ?? 0}s
              </Text>
            </View>
          </View>
        );

      case 'pdf':
        return (
          <View className="flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isPatient ? 'rgba(255,255,255,0.2)' : colors.warningMuted }}
            >
              <DocumentTextIcon
                color={isPatient ? colors.white : colors.warning}
                size={24}
                strokeWidth={2}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold ${isPatient ? 'text-white' : 'text-text-primary'}`}
              >
                PDF Document
              </Text>
              <Text className={`text-xs ${isPatient ? 'text-white/70' : 'text-text-secondary'}`}>
                {message.attachmentName ?? message.content}
              </Text>
            </View>
          </View>
        );

      case 'prescription':
        return (
          <View className="flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isPatient ? 'rgba(255,255,255,0.2)' : colors.secondaryMuted }}
            >
              <BeakerIcon color={isPatient ? colors.white : colors.secondary} size={24} />
            </View>
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold ${isPatient ? 'text-white' : 'text-text-primary'}`}
              >
                Prescription
              </Text>
              <Text className={`text-xs ${isPatient ? 'text-white/70' : 'text-text-secondary'}`}>
                {message.content}
              </Text>
            </View>
          </View>
        );

      case 'report':
        return (
          <View className="flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: isPatient ? 'rgba(255,255,255,0.2)' : colors.primaryMuted }}
            >
              <DocumentChartBarIcon
                color={isPatient ? colors.white : colors.secondary}
                size={24}
              />
            </View>
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold ${isPatient ? 'text-white' : 'text-text-primary'}`}
              >
                Medical Report
              </Text>
              <Text className={`text-xs ${isPatient ? 'text-white/70' : 'text-text-secondary'}`}>
                {message.content}
              </Text>
            </View>
          </View>
        );

      default:
        return (
          <Text
            className={`text-sm leading-5 ${isPatient ? 'text-white' : 'text-text-primary'}`}
          >
            {message.content}
          </Text>
        );
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).springify()}
      style={{
        marginBottom: 12,
        maxWidth: '85%',
        alignSelf: isPatient ? 'flex-end' : 'flex-start',
      }}
    >
      <View
        className="rounded-3xl px-4 py-3"
        style={{
          backgroundColor: isPatient ? '#1E293B' : colors.white,
          ...(isPatient ? {} : shadows.soft),
          borderWidth: isPatient ? 0 : 1,
          borderColor: isPatient ? 'transparent' : colors.secondaryMuted,
        }}
      >
        {bubbleContent()}
      </View>
      <Text
        className={`mt-1 text-[10px] ${isPatient ? 'text-right text-text-secondary' : 'text-text-secondary'}`}
      >
        {formatRelative(message.timestamp)}
      </Text>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: messages = [], isLoading } = useChatMessages(id ?? '');
  const { data: threads = [] } = useChatThreads();
  const { data: patient } = usePatient();
  const { data: medicines = [] } = useMedicines();
  const { data: reports = [] } = useReports();
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const listRef = useRef<FlashListRef<ChatMessage> | null>(null);

  const thread = threads.find((t) => t.id === id);
  const allMessages = [...messages, ...localMessages] as ChatMessage[];

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !id) return;
    const newMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      chatId: id,
      senderType: 'patient',
      type: 'text',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText, id]);

  const recentReports = reports.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center border-b border-border bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-background"
        >
          <ArrowLeftIcon size={20} strokeWidth={2} color={colors.textPrimary} />
        </Pressable>

        <Avatar
          uri={(thread as { doctorAvatar?: string })?.doctorAvatar}
          name={thread?.doctorName ?? 'Doctor'}
          size="md"
          online={(thread as { isOnline?: boolean })?.isOnline}
        />

        <View className="ml-3 flex-1">
          <Text className="text-base font-bold text-text-primary">{thread?.doctorName}</Text>
          <Text className="text-xs text-secondary">
            {(thread as { isOnline?: boolean })?.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        <Pressable
          onPress={() => setSheetVisible(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-primaryMuted"
        >
          <InformationCircleIcon color={colors.secondary} size={22} strokeWidth={2} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.secondary} size="large" />
          </View>
        ) : (
          <FlashList
            ref={listRef}
            data={allMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => <MessageBubble message={item} />}
          />
        )}

        <View className="flex-row items-center border-t border-border bg-white px-4 py-3">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            className="mr-3 flex-1 rounded-full bg-background px-4 py-3 text-base text-text-primary"
            multiline
          />
          <Pressable
            onPress={handleSend}
            className="h-12 w-12 items-center justify-center rounded-full bg-text-primary"
          >
            <PaperAirplaneIcon color={colors.white} size={20} strokeWidth={2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} showCloseButton>
        <Text className="mb-1 text-xl font-bold text-text-primary">Patient Info</Text>
        <Text className="mb-5 text-sm text-text-secondary">Medical summary for doctor review</Text>

        {patient ? (
          <>
            <View className="rounded-2xl bg-background p-4">
              <Text className="text-lg font-bold text-text-primary">{patient.name}</Text>
              <Text className="mt-1 text-sm text-text-secondary">
                Age {patient.age} · Blood group {patient.bloodGroup}
              </Text>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-semibold text-text-primary">Allergies</Text>
              <View className="flex-row flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <View key={a} className="rounded-full bg-dangerMuted px-3 py-1">
                    <Text className="text-xs font-medium text-danger">{a}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-semibold text-text-primary">Conditions</Text>
              <View className="flex-row flex-wrap gap-2">
                {patient.conditions.map((c) => (
                  <View key={c} className="rounded-full bg-warningMuted px-3 py-1">
                    <Text className="text-xs font-medium text-warning">{c}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-semibold text-text-primary">Current Medicines</Text>
              {medicines.slice(0, 4).map((m) => (
                <Text key={m.id} className="text-sm text-text-secondary">
                  · {(m as { name: string; dosage: string }).name}{' '}
                  {(m as { dosage: string }).dosage}
                </Text>
              ))}
            </View>

            <View className="mt-4">
              <Text className="mb-2 text-sm font-semibold text-text-primary">Recent Reports</Text>
              {recentReports.map((r) => (
                <Text key={r.id} className="text-sm text-text-secondary">
                  · {(r as { title: string }).title}
                </Text>
              ))}
            </View>

            <View className="mt-4 rounded-2xl bg-primaryMuted p-4">
              <Text className="text-sm font-semibold text-text-primary">Last Visit</Text>
              <Text className="mt-1 text-sm text-text-secondary">
                {formatDate((patient as { lastVisit?: string }).lastVisit ?? '2026-06-12')}
              </Text>
            </View>
          </>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}
