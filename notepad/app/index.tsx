import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const inset = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Basic mock login
    // if (email || password) {
    //   router.replace('/home');
    // } else {
    //   router.replace('/home'); // Fallback to allowing empty login for testing
    // }
    alert("logged in")
    console.log("Login::::::::::::::::::::::::::::::", email, password);
    router.replace('/home');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { marginTop: inset.top, marginBottom: inset.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800' }}
            style={styles.heroImage}
          />
          <View style={styles.overlay} />
          <View style={styles.logoContainer}>
            <BookOpen size={48} color="#fff" />
            <Text style={styles.heroTitle}>Notepad Expo 123</Text>
            <Text style={styles.heroSubtitle}>Capture your thoughts instantly</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome back</Text>

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  heroContainer: { height: '50%', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  logoContainer: { alignItems: 'center', zIndex: 1 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 12 },
  heroSubtitle: { fontSize: 16, color: '#f0f0f0', marginTop: 8 },
  formContainer: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 24 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, color: '#333' },
  loginBtn: { backgroundColor: '#0066cc', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 10 },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
