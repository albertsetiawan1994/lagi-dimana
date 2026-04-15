import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const DAYS = [
  { day: 'Sen', date: 23 },
  { day: 'Sel', date: 24 },
  { day: 'Rab', date: 25, active: true },
  { day: 'Kam', date: 26 },
  { day: 'Jum', date: 27 },
  { day: 'Sab', date: 28 },
];

interface TimelineItem {
  id: string;
  title: string;
  time: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  timeBg: string;
  timeColor: string;
  isCurrent?: boolean;
  image?: string;
  distance?: string;
}

const TIMELINE: TimelineItem[] = [
  {
    id: '1',
    title: 'Rumah (Titik Awal)',
    time: '07:00',
    description: 'Berangkat menuju sekolah dengan bus jemputan.',
    icon: 'home',
    iconBg: Colors.tertiaryContainer,
    iconColor: Colors.tertiary,
    timeBg: Colors.tertiaryFixed,
    timeColor: Colors.onTertiaryFixed,
  },
  {
    id: '2',
    title: 'SD Pelita Harapan',
    time: '07:45',
    description: 'Tiba di sekolah tepat waktu. Status: Aman.',
    icon: 'school',
    iconBg: Colors.secondaryContainer,
    iconColor: Colors.secondary,
    timeBg: Colors.secondaryFixedDim,
    timeColor: Colors.onSecondaryFixed,
  },
  {
    id: '3',
    title: 'Taman Kota Bunga',
    time: '14:20',
    description: 'Sedang beristirahat dan bermain setelah jam sekolah usai.',
    icon: 'leaf',
    iconBg: Colors.primaryContainer,
    iconColor: 'white',
    timeBg: Colors.surfaceVariant,
    timeColor: Colors.primaryDim,
    distance: '2.4 km dari lokasi Anda',
  },
  {
    id: '4',
    title: 'Sedang Berjalan',
    time: 'Sekarang',
    description: 'Menuju tempat kursus robotik.',
    icon: 'walk',
    iconBg: 'white',
    iconColor: Colors.primary,
    timeBg: Colors.primaryContainer,
    timeColor: Colors.onPrimaryContainer,
    isCurrent: true,
  },
];

export default function HistoryScreen() {
  const [selectedDay, setSelectedDay] = useState(25);
  const [currentMonth] = useState('April 2026');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarSmall}>
            <Ionicons name="person" size={18} color={Colors.secondary} />
          </View>
          <Text style={styles.headerTitle}>Riwayat</Text>
        </View>
        <Text style={styles.appName}>Lagi Dimana</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.calendarSection}>
          <View style={styles.monthRow}>
            <Text style={styles.monthTitle}>{currentMonth}</Text>
            <View style={styles.monthNav}>
              <TouchableOpacity style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {DAYS.map(d => (
              <TouchableOpacity
                key={d.date}
                style={[styles.dayChip, selectedDay === d.date && styles.dayChipActive]}
                onPress={() => setSelectedDay(d.date)}
              >
                <Text style={[styles.dayLabel, selectedDay === d.date && styles.dayLabelActive]}>{d.day}</Text>
                <Text style={[styles.dateNum, selectedDay === d.date && styles.dateNumActive]}>{d.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.timeline}>
          {TIMELINE.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.timelineIcon,
                  { backgroundColor: item.iconBg },
                  item.isCurrent && styles.timelineIconCurrent,
                ]}>
                  <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
                </View>
                {index < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={[styles.timelineCard, item.isCurrent && styles.timelineCardCurrent]}>
                <View style={styles.timelineCardHeader}>
                  <Text style={[styles.timelineTitle, item.isCurrent && { color: Colors.primaryDim }]}>
                    {item.title}
                  </Text>
                  <View style={[styles.timeBadge, { backgroundColor: item.timeBg }]}>
                    <Text style={[styles.timeBadgeText, { color: item.timeColor }]}>{item.time}</Text>
                  </View>
                </View>

                <Text style={styles.timelineDesc}>{item.description}</Text>

                {item.distance && (
                  <View style={styles.distanceRow}>
                    <Ionicons name="navigate" size={14} color={Colors.primary} />
                    <Text style={styles.distanceText}>{item.distance}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.secondary },
  appName: { fontSize: 20, fontWeight: '900', color: Colors.primary, marginLeft: 'auto', marginRight: 4 },
  avatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
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
  calendarSection: { padding: 20 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  monthTitle: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  monthNav: { flexDirection: 'row', gap: 4 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChip: {
    minWidth: 52,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  dayChipActive: {
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayLabel: { fontSize: 10, fontWeight: '700', color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  dayLabelActive: { color: Colors.onPrimaryContainer },
  dateNum: { fontSize: 18, fontWeight: '800', color: Colors.onSurfaceVariant },
  dateNumActive: { color: Colors.onPrimaryContainer },
  timeline: { paddingHorizontal: 20, paddingBottom: 20 },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 48 },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1,
  },
  timelineIconCurrent: {
    borderWidth: 4,
    borderColor: Colors.primaryContainer,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: Colors.surfaceVariant,
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  timelineCardCurrent: {
    backgroundColor: `${Colors.primaryContainer}15`,
    borderWidth: 2,
    borderColor: `${Colors.primaryContainer}40`,
  },
  timelineCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  timelineTitle: { fontSize: 15, fontWeight: '800', color: Colors.onSurface, flex: 1, marginRight: 8 },
  timeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  timeBadgeText: { fontSize: 11, fontWeight: '700' },
  timelineDesc: { fontSize: 13, color: Colors.onSurfaceVariant, lineHeight: 18 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  distanceText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
});
