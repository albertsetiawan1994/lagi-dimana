# Lagi Dimana - Family GPS Tracking App

## Overview
Mobile app untuk tracking lokasi keluarga secara real-time. Dibangun dengan Expo (React Native) + Firebase Firestore + Google Maps API.

## Tech Stack
- **Framework**: Expo (React Native) dengan Expo Router
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Email/Password)
- **Peta**: Google Maps JavaScript API (via WebView)
- **Lokasi**: expo-location

## Struktur Aplikasi

### Halaman Autentikasi (`app/(auth)/`)
- `login.tsx` - Halaman masuk (email + password)
- `register.tsx` - Halaman daftar akun baru

### Tab Utama (`app/(tabs)/`)
- `index.tsx` - Peta utama dengan Google Maps, pin anggota keluarga, tombol SOS
- `chat.tsx` - Chat grup keluarga dengan Firestore real-time
- `members.tsx` - Daftar anggota keluarga dengan status & battery
- `history.tsx` - Riwayat perjalanan harian berbasis timeline
- `profile.tsx` - Profil pengguna, pilih karakter, misi keselamatan

### Library (`lib/`)
- `firebase.ts` - Konfigurasi Firebase
- `AuthContext.tsx` - Context autentikasi global
- `locationService.ts` - Service untuk update & read lokasi GPS

## Environment Variables (Secrets)
- `FIREBASE_API_KEY` → `EXPO_PUBLIC_FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN` → `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID` → `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET` → `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID` → `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID` → `EXPO_PUBLIC_FIREBASE_APP_ID`
- `GOOGLE_MAPS_API_KEY` → `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

## Dev Server
```
EXPO_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY ... npx expo start --web --port 8081
```

## Design System
Warna utama dari Material Design 3:
- Primary: `#006289` (biru teal)
- Secondary: `#745700` (kuning-coklat)
- Tertiary: `#20674f` (hijau)
- Background: `#f2f7ff` (biru muda)

## Fitur Firestore
- Collection `users/{uid}` - profil + lokasi real-time
- Collection `familyGroups/{groupId}/messages` - chat real-time
- Collection `locationHistory/{uid}/points` - riwayat perjalanan
