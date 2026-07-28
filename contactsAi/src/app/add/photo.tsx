import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAddPerson } from '../../context/AddPersonContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, User } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function AddPhotoScreen() {
  const { data, updateData } = useAddPerson();
  const router = useRouter();

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      updateData({ image: result.assets[0].uri });
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.content}>
        <Text style={styles.title}>Add a photo</Text>
        
        <View style={styles.photoContainer}>
          {data.image ? (
            <Image source={{ uri: data.image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <User color={Colors.textMuted} size={64} />
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={handlePickImage}>
            <ImageIcon color={Colors.text} size={24} />
            <Text style={styles.actionText}>Upload from Gallery</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={handlePickImage}>
            <Camera color={Colors.text} size={24} />
            <Text style={styles.actionText}>Take a Photo</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.skipBtn} onPress={() => router.push('/add/phone')}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
          <Pressable 
            style={[styles.button, !data.image && styles.buttonDisabled]} 
            onPress={() => router.push('/add/phone')}
            disabled={!data.image}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 40,
    marginTop: 20,
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.cardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  actions: {
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardHighlight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 40,
    gap: 16,
  },
  skipBtn: {
    padding: 16,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  }
});
