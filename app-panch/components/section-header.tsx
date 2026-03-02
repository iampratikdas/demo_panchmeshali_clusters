import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export type SectionHeaderProps = {
    title: string;
    showViewAll?: boolean;
    onViewAllPress?: () => void;
};

export function SectionHeader({ title, showViewAll = false, onViewAllPress }: SectionHeaderProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {showViewAll && (
                <Pressable onPress={onViewAllPress}>
                    <Text style={styles.viewAll}>View all</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#70D9B8',
    },
});
