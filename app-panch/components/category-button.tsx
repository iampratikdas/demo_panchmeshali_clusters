import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';

export type CategoryButtonProps = {
    label: string;
    isActive?: boolean;
    onPress?: () => void;
};

export function CategoryButton({ label, isActive = false, onPress }: CategoryButtonProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                isActive && styles.buttonActive,
                pressed && styles.buttonPressed
            ]}
            onPress={onPress}
        >
            <Text style={[styles.text, isActive && styles.textActive]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonActive: {
        backgroundColor: '#70D9B8',
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.96 }],
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    textActive: {
        color: '#1a1a1a',
    },
});
