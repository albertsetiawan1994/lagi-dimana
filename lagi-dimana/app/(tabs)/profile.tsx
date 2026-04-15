import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CHARACTERS = ['🧑‍🚀', '👩‍🎤', '🧙‍♂️', '🦸‍♀️'];

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth();
  const [name, setName] = useState(userProfile?.name || user?.displayName || 'Pengguna');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [selectedChar, setSelectedChar] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, phone });
      Alert.alert('Berhasil', 'Profil berhasil disimpan!');
    } catch (e) {
      Alert.alert('Gagal', 'Tidak dapat menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah kamu ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const level = userProfile?.level || 1;
  const progress = userProfile?.progress || 85;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={18} color={Colors.primaryContainer} />
          </View>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        <Text style={styles.appName}>Lagi Dimana</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.heroSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarEmoji}>{CHARACTERS[selectedChar]}</Text>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroId}>ID: #{user?.uid?.slice(0, 6).toUpperCase() || '----'}</Text>
        </View>

        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionHeaderLeft}>
              <Ionicons name="shield-checkmark" size={22} color={Colors.tertiary} />
              <Text style={styles.missionTitle}>Misi Keselamatan</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Level {level}</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progres Penjaga</Text>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.missionDesc}>
            Hebat! Kamu sudah memberi tahu Bunda setiap sampai di sekolah selama 5 hari berturut-turut.
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Panggilan</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="happy-outline" size={20} color={Colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama kamu"
                placeholderTextColor={Colors.outlineVariant}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
              <TextInput
                style={styles.input}
                placeholder="Nomor HP Bunda/Ayah"
                placeholderTextColor={Colors.outlineVariant}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.charSection}>
          <Text style={styles.charTitle}>Pilih Karaktermu</Text>
          <View style={styles.charGrid}>
            {CHARACTERS.map((char, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.charItem, selectedChar === i && styles.charItemSelected]}
                onPress={() => setSelectedChar(i)}
              >
                <Text style={styles.charEmoji}>{char}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  appName: { fontSize: 20, fontWeight: '900', color: Colors.primary, marginLeft: 'auto', marginRight: 4 },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  heroSection: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  avatarLarge: {
    width: 130,
    height: 130,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.secondaryContainer,
    position: 'relative',
  },
  avatarEmoji: { fontSize: 64 },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heroName: { fontSize: 28, fontWeight: '900', color: Colors.primary },
  heroId: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  missionCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: `${Colors.tertiaryContainer}30`,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  missionTitle: { fontSize: 16, fontWeight: '700', color: Colors.tertiary },
  levelBadge: { backgroundColor: Colors.tertiary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  levelText: { fontSize: 12, fontWeight: '800', color: Colors.onTertiary },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 13, fontWeight: '700', color: Colors.tertiaryDim },
  progressPct: { fontSize: 13, fontWeight: '700', color: Colors.tertiaryDim },
  progressBar: { height: 14, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 99, overflow: 'hidden' },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.tertiary,
    borderRadius: 99,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  missionDesc: { fontSize: 12, color: Colors.onTertiaryFixedVariant, lineHeight: 18 },
  formSection: { paddingHorizontal: 16, gap: 14, marginBottom: 20 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.onSurfaceVariant, paddingLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  input: { flex: 1, fontSize: 15, color: Colors.onSurface, fontWeight: '600' },
  charSection: { paddingHorizontal: 16, marginBottom: 20 },
  charTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary, marginBottom: 14 },
  charGrid: { flexDirection: 'row', gap: 12 },
  charItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charItemSelected: {
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 3,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  charEmoji: { fontSize: 36 },
  saveBtn: {
    marginHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  saveBtnText: { fontSize: 18, fontWeight: '800', color: Colors.onPrimary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
});
