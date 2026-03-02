import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';

export type AuthorAvatarProps = {
    name: string;
    imageSource: ImageSourcePropType;
    backgroundColor: string;
    onPress?: () => void;
};

export function AuthorAvatar({ name, imageSource, backgroundColor, onPress }: AuthorAvatarProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.containerPressed
            ]}
            onPress={onPress}
        >
            <View style={[styles.avatarContainer, { backgroundColor }]}>
                <Image source={imageSource} style={styles.avatar} contentFit="cover" />
            </View>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 80,
    },
    containerPressed: {
        opacity: 0.7,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
    },
});
