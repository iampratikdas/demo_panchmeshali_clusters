import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

export type StoryCardProps = {
    title: string;
    chapters: number;
    imageSource: ImageSourcePropType;
    onPress?: () => void;
};

export function StoryCard({ title, chapters, imageSource, onPress }: StoryCardProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed
            ]}
            onPress={onPress}
        >
            <Image source={imageSource} style={styles.image} contentFit="cover" />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>{title}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{chapters}</Text>
                        <Text style={styles.badgeLabel}>Chapters</Text>
                    </View>
                </View>
            </LinearGradient>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 140,
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
        justifyContent: 'flex-end',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    badgeText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    badgeLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
    },
});
