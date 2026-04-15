import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/lib/AuthContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateUserLocation } from '@/lib/locationService';

const { width, height } = Dimensions.get('window');
const MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

interface FamilyMember {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  location?: { latitude: number; longitude: number };
  lastSeen?: any;
  status?: string;
}

const DEMO_MEMBERS: FamilyMember[] = [
  { uid: '1', name: 'Adik', location: { latitude: -6.2088, longitude: 106.8456 }, status: 'Sekolah' },
  { uid: '2', name: 'Kakak', location: { latitude: -6.2200, longitude: 106.8200 }, status: 'Kafe' },
  { uid: '3', name: 'Ibu', location: { latitude: -6.1950, longitude: 106.8650 }, status: 'Supermarket' },
];

const STATUS_COLORS: Record<string, string> = {
  'Sekolah': Colors.secondaryContainer,
  'Kafe': Colors.tertiaryContainer,
  'Supermarket': Colors.primaryContainer,
  'Rumah': Colors.tertiaryContainer,
  'default': Colors.surfaceContainerHigh,
};

function buildMapHtml(members: FamilyMember[], apiKey: string) {
  const center = members[0]?.location || { latitude: -6.2088, longitude: 106.8456 };
  const markersJs = members.map((m, i) => {
    if (!m.location) return '';
    const colors = ['#006289', '#745700', '#20674f'];
    return `
      new google.maps.Marker({
        position: { lat: ${m.location.latitude}, lng: ${m.location.longitude} },
        map: map,
        title: '${m.name}',
        label: { text: '${m.name[0]}', color: 'white', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 22,
          fillColor: '${colors[i % colors.length]}',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 3,
        }
      });
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
<style>
* { margin: 0; padding: 0; }
html, body, #map { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: ${center.latitude}, lng: ${center.longitude} },
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8d8f0' }] }
    ]
  });
  ${markersJs}
}
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body>
</html>`;
}

export default function MapScreen() {
  const { user, userProfile } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>(DEMO_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [search, setSearch] = useState('');

  const handleShareLocation = async () => {
    if (!user) return;
    setLoading(true);
    const loc = await updateUserLocation(user.uid, userProfile?.familyGroupId || 'default');
    setLoading(false);
    if (loc) {
      Alert.alert('Berhasil', 'Lokasi kamu sudah diperbarui!');
    } else {
      Alert.alert('Gagal', 'Izinkan akses lokasi di pengaturan perangkat.');
    }
  };

  const handleSOS = () => {
    Alert.alert(
      '🆘 SOS Darurat',
      'Apakah kamu ingin mengirim sinyal darurat ke semua anggota keluarga?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim SOS',
          style: 'destructive',
          onPress: () => Alert.alert('SOS Terkirim', 'Semua anggota keluarga sudah diberitahu.'),
        },
      ]
    );
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Lagi Dimana</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={handleShareLocation}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="location" size={22} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: buildMapHtml(members, MAPS_API_KEY || '') }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
        />

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari anggota atau lokasi..."
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {selectedMember && (
          <View style={styles.memberPopup}>
            <View style={styles.memberPopupAvatar}>
              <Ionicons name="person-circle" size={40} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberPopupName}>{selectedMember.name}</Text>
              <Text style={styles.memberPopupStatus}>{selectedMember.status}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedMember(null)}>
              <Ionicons name="close" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statusCard}>
          <View style={styles.statusIconBox}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.statusTitle}>Semua Aman</Text>
            <Text style={styles.statusSubtitle}>{members.length} anggota keluarga di zona aman</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
          <Ionicons name="alert-circle" size={36} color={Colors.onError} />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersRow} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
        {filteredMembers.map(member => (
          <TouchableOpacity key={member.uid} style={styles.memberChip} onPress={() => setSelectedMember(member)}>
            <View style={[styles.memberChipAvatar, { backgroundColor: STATUS_COLORS[member.status || 'default'] }]}>
              <Text style={styles.memberChipInitial}>{member.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.memberChipName}>{member.name}</Text>
              <Text style={styles.memberChipStatus}>{member.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
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
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  searchBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.onSurface, fontWeight: '500' },
  memberPopup: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  memberPopupAvatar: {},
  memberPopupName: { fontSize: 16, fontWeight: '800', color: Colors.onSurface },
  memberPopupStatus: { fontSize: 13, color: Colors.onSurfaceVariant, fontWeight: '500' },
  statusCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primaryContainer}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: { fontSize: 14, fontWeight: '800', color: Colors.onBackground },
  statusSubtitle: { fontSize: 11, color: Colors.onSurfaceVariant, marginTop: 2 },
  sosBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: Colors.errorContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  sosText: { fontSize: 10, fontWeight: '900', color: Colors.onError, letterSpacing: 1, marginTop: 2 },
  membersRow: {
    maxHeight: 90,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 12,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  memberChipAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberChipInitial: { fontSize: 15, fontWeight: '800', color: Colors.onSurface },
  memberChipName: { fontSize: 13, fontWeight: '700', color: Colors.onSurface },
  memberChipStatus: { fontSize: 11, color: Colors.onSurfaceVariant },
});
