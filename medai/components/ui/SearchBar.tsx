import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { cn } from '@/components/lib/cn';
import { colors } from '@/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  className?: string;
  testID?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search records, doctors, medicines...',
  onClear,
  editable = true,
  autoFocus = false,
  className,
  testID,
}: SearchBarProps) {
  const showClear = value.length > 0;

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      className={cn(
        'min-h-12 flex-row items-center rounded-3xl border border-border bg-card px-4',
        className,
      )}
    >
      <MagnifyingGlassIcon color={colors.textSecondary} size={20} strokeWidth={2} />
      <TextInput
        testID={testID}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        className="ml-3 flex-1 py-3 text-base text-text-primary"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        autoFocus={autoFocus}
      />
      {showClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={handleClear}
          hitSlop={8}
          className="h-12 w-12 items-center justify-center"
        >
          <XMarkIcon color={colors.textSecondary} size={18} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}
