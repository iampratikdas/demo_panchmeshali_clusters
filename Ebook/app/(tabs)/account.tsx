import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate back to the login screen and wipe history
    router.replace('/');
  };

  const MENU_ITEMS = [
    { id: '1', title: 'Settings', icon: 'settings', route: '/settings' },
    { id: '2', title: 'Language', icon: 'language', route: '/language' },
    { id: '3', title: 'Help & Support', icon: 'help-outline', route: '/Help' },
    { id: '4', title: 'Contact Us', icon: 'mail-outline', route: '/contact' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: 'https://picsum.photos/seed/johndoe/200/200' }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>johndoe@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialIcons name="edit" size={20} color="#d4af37" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route ? router.push(item.route as any) : null}
            >
              <View style={styles.menuIconContainer}>
                <MaterialIcons name={item.icon as any} size={22} color="#555" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <MaterialIcons name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fdfbf7', paddingTop: Platform.OS === 'android' ? 34 : 0 },
  container: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { paddingTop: 16, paddingBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  profileCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  profileImage: { width: 70, height: 70, borderRadius: 35, marginRight: 16, backgroundColor: '#eee' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: '#888', fontWeight: '500' },
  editBtn: { padding: 10, backgroundColor: '#fef8e7', borderRadius: 20 },
  menuContainer: { backgroundColor: '#fff', borderRadius: 24, paddingVertical: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, marginBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuTitle: { flex: 1, fontSize: 16, color: '#333', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#e53935', borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3, shadowColor: '#e53935', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
