import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  createdAt: any;
}

const DEMO_MESSAGES: Message[] = [
  { id: '1', text: 'Jangan lupa makan siang ya anak-anak! Mama sudah masak rendang di rumah 🏠✨', senderName: 'Mama', senderId: 'mama', createdAt: { toDate: () => new Date('2024-01-01T12:05:00') } },
  { id: '2', text: 'Siap Ma! Aku lagi di jalan pulang nih sama Budi.', senderName: 'Kamu', senderId: 'self', createdAt: { toDate: () => new Date('2024-01-01T12:08:00') } },
  { id: '3', text: 'Papa juga sudah selesai meeting. Hati-hati di jalan ya jagoan-jagoan Papa! 🚗💨', senderName: 'Papa', senderId: 'papa', createdAt: { toDate: () => new Date('2024-01-01T12:12:00') } },
  { id: '4', text: 'Nitip es krim dong Kak! 🍦🥺', senderName: 'Adek', senderId: 'adek', createdAt: { toDate: () => new Date('2024-01-01T12:15:00') } },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
  return name.slice(0, 1).toUpperCase();
}

const AVATAR_COLORS: Record<string, string> = {
  'Mama': Colors.secondaryContainer,
  'Papa': Colors.primaryContainer,
  'Adek': Colors.tertiaryContainer,
};

export default function ChatScreen() {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const groupId = userProfile?.familyGroupId || 'default';

  useEffect(() => {
    const q = query(
      collection(db, 'familyGroups', groupId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      if (msgs.length > 0) setMessages([...DEMO_MESSAGES, ...msgs]);
    });
    return unsub;
  }, [groupId]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    const msg = text.trim();
    setText('');
    await addDoc(collection(db, 'familyGroups', groupId, 'messages'), {
      text: msg,
      senderName: userProfile?.name || user.email || 'Kamu',
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSelf = item.senderId === user?.uid || item.senderId === 'self';
    const time = item.createdAt?.toDate ? formatTime(item.createdAt.toDate()) : '';
    const avatarColor = AVATAR_COLORS[item.senderName] || Colors.surfaceContainerHigh;

    return (
      <View style={[styles.messageRow, isSelf && styles.messageRowSelf]}>
        {!isSelf && (
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(item.senderName)}</Text>
          </View>
        )}
        <View style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}>
          {!isSelf && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text style={[styles.messageText, isSelf && styles.messageTextSelf]}>{item.text}</Text>
          <Text style={[styles.timeText, isSelf && styles.timeTextSelf]}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.groupAvatar}>
          <Ionicons name="people" size={20} color={Colors.primary} />
          <View style={styles.onlineDot} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Keluarga Cemara</Text>
          <Text style={styles.headerSub}>5 Anggota Online</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>Hari Ini</Text>
          </View>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add-circle" size={26} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ketik pesan..."
              placeholderTextColor={Colors.outlineVariant}
              value={text}
              onChangeText={setText}
              multiline
            />
            <TouchableOpacity>
              <Ionicons name="location" size={20} color={Colors.tertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.outlineVariant}20`,
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.tertiary,
    borderWidth: 2,
    borderColor: 'white',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.onBackground },
  headerSub: { fontSize: 11, color: Colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerActions: { flexDirection: 'row', marginLeft: 'auto', gap: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  messagesList: { padding: 16, gap: 16 },
  dateDivider: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 99,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end', marginBottom: 12 },
  messageRowSelf: { flexDirection: 'row-reverse' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.onSurface },
  bubble: {
    maxWidth: '78%',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  bubbleOther: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  bubbleSelf: {
    backgroundColor: Colors.primaryContainer,
    borderBottomRightRadius: 4,
  },
  senderName: { fontSize: 10, fontWeight: '800', color: Colors.secondary, marginBottom: 4 },
  messageText: { fontSize: 14, color: Colors.onSurface, lineHeight: 20 },
  messageTextSelf: { color: Colors.onPrimaryContainer },
  timeText: { fontSize: 9, color: '#9ca3af', marginTop: 6, textAlign: 'right' },
  timeTextSelf: { color: `${Colors.onPrimaryContainer}80` },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: `${Colors.outlineVariant}20`,
  },
  attachBtn: {},
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, color: Colors.onSurface, fontWeight: '500' },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
