import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useNoteStore } from '../store/useNoteStore';
import * as ImagePicker from 'expo-image-picker';
import { Check, X } from 'lucide-react-native';

// React Native Pell Rich Editor causes "window is not defined" on Web and SSR.
// We conditionally require it only on native platforms.
let RichEditor: any;
let RichToolbar: any;
let actions: any = {};

if (Platform.OS !== 'web') {
  const pell = require('react-native-pell-rich-editor');
  RichEditor = pell.RichEditor;
  RichToolbar = pell.RichToolbar;
  actions = pell.actions;
}

export default function CreateNoteScreen() {
  const router = useRouter();
  const addNote = useNoteStore((state) => state.addNote);
  const richText = useRef<any>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (title.trim() === '') {
      alert('Please enter a title');
      return;
    }
    addNote({ title, content });
    router.back();
  };

  const handleInsertImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      richText.current?.insertImage(
        result.assets[0].uri,
        'width: 100%; border-radius: 8px;'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <X size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleSave}>
          <Check size={24} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Note Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#999"
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.editorContainer}
      >
        <ScrollView style={styles.scroll}>
          {Platform.OS === 'web' ? (
            <TextInput
              style={styles.webEditor}
              placeholder="Start writing your thoughts here... (Rich text is disabled on Web preview)"
              multiline
              value={content}
              onChangeText={setContent}
              placeholderTextColor="#aaa"
            />
          ) : (
            <RichEditor
              ref={richText}
              style={styles.rich}
              placeholder="Start writing your thoughts here..."
              initialContentHTML=""
              onChange={setContent}
              editorStyle={{
                backgroundColor: '#fff',
                color: '#333',
                placeholderColor: '#aaa',
              }}
            />
          )}
        </ScrollView>
        {Platform.OS !== 'web' && (
          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold, 
              actions.setItalic, 
              actions.setUnderline, 
              actions.insertBulletsList, 
              actions.insertImage
            ]}
            onPressAddImage={handleInsertImage}
            style={styles.toolbar}
            iconTint="#666"
            selectedIconTint="#0066cc"
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  titleInput: { fontSize: 24, fontWeight: '700', color: '#222', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#fff' },
  editorContainer: { flex: 1 },
  scroll: { flex: 1, backgroundColor: '#fff' },
  rich: { flex: 1, paddingHorizontal: 10, minHeight: 300 },
  webEditor: { flex: 1, paddingHorizontal: 20, fontSize: 16, color: '#333', minHeight: 300, textAlignVertical: 'top' },
  toolbar: { backgroundColor: '#fcfcfc', borderTopWidth: 1, borderTopColor: '#f0f0f0' }
});
