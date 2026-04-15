import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/lib/AuthContext';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const logoImage = require('@/assets/images/logo.png');

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { resetPassword } = useAuth();

  const handleReset = async () => {
    if (!email.trim()) {
      setErrorMsg('Masukkan alamat email kamu.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      await resetPassword(email.trim());
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
        setErrorMsg('Email tidak ditemukan. Periksa kembali alamat email kamu.');
      } else {
        setErrorMsg('Gagal mengirim email. Coba lagi.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#f2f7ff', '#d8eaff']} style={StyleSheet.absoluteFill} />

      <View style={styles.inner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Lupa Kata Sandi?</Text>
          <Text style={styles.subtitle}>
            Tenang! Masukkan email kamu dan kami akan kirimkan link untuk membuat kata sandi baru.
          </Text>
        </View>

        {status === 'success' ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <Ionicons name="mail" size={40} color={Colors.tertiary} />
            </View>
            <Text style={styles.successTitle}>Email Terkirim!</Text>
            <Text style={styles.successText}>
              Kami sudah mengirimkan link reset kata sandi ke{'\n'}
              <Text style={styles.successEmail}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Cek inbox atau folder spam kamu. Link berlaku selama 1 jam.
            </Text>
            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.backToLoginText}>Kembali ke Halaman Masuk</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alamat Email</Text>
              <View style={[styles.inputWrapper, status === 'error' && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={Colors.onSurfaceVariant} />
                <TextInput
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor={Colors.outlineVariant}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setStatus('idle'); setErrorMsg(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
              </View>
              {status === 'error' && (
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={14} color="#d32f2f" />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.resetBtn, status === 'loading' && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <>
                  <Ionicons name="send" size={18} color={Colors.onPrimary} />
                  <Text style={styles.resetBtnText}>Kirim Link Reset</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.infoText}>
                Link reset akan dikirim ke email yang terdaftar. Pastikan email kamu benar.
              </Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, paddingTop: 56 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  backText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  header: { alignItems: 'center', marginBottom: 32, gap: 12 },
  logo: { width: 110, height: 110 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.primary, letterSpacing: -0.5 },
  subtitle: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    gap: 20,
    shadowColor: '#08314d',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  inputGroup: { gap: 8 },
  label: { fontSize: 15, fontWeight: '700', color: Colors.onSurface, paddingLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputError: { borderColor: '#d32f2f' },
  input: { flex: 1, fontSize: 15, color: Colors.onSurface, fontWeight: '500' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 },
  errorText: { fontSize: 13, color: '#d32f2f', fontWeight: '600', flex: 1 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  resetBtnText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '800' },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
    lineHeight: 18,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#08314d',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.tertiaryContainer}80`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  successText: { fontSize: 15, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  successEmail: { fontWeight: '800', color: Colors.onSurface },
  successHint: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  backToLoginBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  backToLoginText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '800' },
});
