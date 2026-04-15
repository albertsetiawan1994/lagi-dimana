import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/AuthContext';

interface Member {
  id: string;
  name: string;
  role: string;
  status: string;
  location: string;
  lastSeen: string;
  battery: number;
  isLowBattery?: boolean;
  color: string;
  icon: string;
}

const DEMO_MEMBERS: Member[] = [
  {
    id: '1', name: 'Budi', role: 'Anak', status: 'Aman', location: 'Sedang di Sekolah',
    lastSeen: 'Dilihat 2 menit yang lalu', battery: 84, color: Colors.secondary,
    icon: 'school',
  },
  {
    id: '2', name: 'Kakek Sastro', role: 'Kakek', status: 'Berjalan', location: 'Tiba di Rumah',
    lastSeen: 'Dilihat sekarang', battery: 12, isLowBattery: true, color: Colors.primary,
    icon: 'home',
  },
  {
    id: '3', name: 'Adik Siti', role: 'Anak', status: 'Aktif', location: 'Sedang di Taman',
    lastSeen: 'Dilihat 10 menit yang lalu', battery: 100, color: Colors.tertiary,
    icon: 'leaf',
  },
];

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  'Aman': { bg: Colors.tertiaryContainer, text: Colors.tertiary },
  'Berjalan': { bg: Colors.secondaryContainer, text: Colors.secondary },
  'Aktif': { bg: Colors.primaryContainer, text: Colors.primary },
};

export default function MembersScreen() {
  const { user } = useAuth();
  const [members] = useState(DEMO_MEMBERS);

  const handleChat = (name: string) => Alert.alert('Chat', `Membuka chat dengan ${name}`);
  const handleCall = (name: string) => Alert.alert('Telepon', `Menelepon ${name}...`);
  const handleAddMember = () => Alert.alert('Tambah Anggota', 'Fitur ini akan segera tersedia');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Lagi Dimana</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Grup Keluarga Saya</Text>
          <Text style={styles.subtitle}>Memastikan semua orang aman dan terlindungi.</Text>
        </View>

        {members.map(member => {
          const badge = STATUS_BADGE[member.status] || { bg: Colors.surfaceContainerHigh, text: Colors.onSurface };
          return (
            <View key={member.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatarBox}>
                  <View style={[styles.avatar, { borderColor: member.color }]}>
                    <Ionicons name="person" size={32} color={member.color} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.text }]}>{member.status}</Text>
                  </View>
                </View>
                <View style={styles.batteryInfo}>
                  <Ionicons
                    name={member.isLowBattery ? 'battery-dead' : member.battery > 50 ? 'battery-full' : 'battery-half'}
                    size={16}
                    color={member.isLowBattery ? Colors.error : Colors.tertiary}
                  />
                  <Text style={[styles.batteryText, { color: member.isLowBattery ? Colors.error : Colors.tertiary }]}>
                    {member.battery}%
                  </Text>
                </View>
              </View>

              <Text style={styles.memberName}>{member.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name={member.icon as any} size={16} color={Colors.primary} />
                <Text style={styles.locationText}>{member.location}</Text>
              </View>
              <Text style={styles.lastSeen}>{member.lastSeen}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.chatBtn} onPress={() => handleChat(member.name)}>
                  <Ionicons name="chatbubble" size={18} color="white" />
                  <Text style={styles.chatBtnText}>Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(member.name)}>
                  <Ionicons name="call" size={18} color={Colors.primary} />
                  <Text style={styles.callBtnText}>Telepon</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addCard} onPress={handleAddMember}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={32} color="white" />
          </View>
          <Text style={styles.addTitle}>Tambah Anggota</Text>
          <Text style={styles.addSubtitle}>Ajak anggota keluarga lain untuk bergabung di grup ini.</Text>
        </TouchableOpacity>

        <View style={styles.safeZoneInfo}>
          <View style={styles.safeZoneIcon}>
            <Ionicons name="shield-checkmark" size={28} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.safeZoneTitle}>Zona Aman Aktif</Text>
            <Text style={styles.safeZoneText}>Semua anggota berada di dalam zona aman. Notifikasi akan dikirim jika ada yang keluar jalur.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
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
  titleSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.onSurfaceVariant, fontWeight: '500', marginTop: 4 },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  avatarBox: { position: 'relative' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  batteryInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  batteryText: { fontSize: 13, fontWeight: '700' },
  memberName: { fontSize: 22, fontWeight: '800', color: Colors.onSurface, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  locationText: { fontSize: 14, color: Colors.onSurfaceVariant, fontWeight: '600', fontStyle: 'italic' },
  lastSeen: { fontSize: 10, color: Colors.outline, marginBottom: 16 },
  actions: { flexDirection: 'row', gap: 10 },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  chatBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 14,
    paddingVertical: 14,
  },
  callBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  addCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${Colors.primary}30`,
    borderStyle: 'dashed',
    backgroundColor: `${Colors.primaryContainer}15`,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  addIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary },
  addSubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, textAlign: 'center' },
  safeZoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: `${Colors.tertiaryContainer}40`,
    borderRadius: 20,
    padding: 20,
  },
  safeZoneIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeZoneTitle: { fontSize: 17, fontWeight: '800', color: Colors.onTertiaryContainer, marginBottom: 4 },
  safeZoneText: { fontSize: 13, color: Colors.onTertiaryFixedVariant, lineHeight: 18 },
});
