import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  User,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { router } from 'expo-router';
import { Platform, Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  familyGroupId?: string;
  level?: number;
  progress?: number;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          }
        } catch (e) {
          console.log('Error loading profile:', e);
        }
        router.replace('/(tabs)');
      } else {
        setUserProfile(null);
        router.replace('/(auth)/login');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Info', 'Login Google saat ini hanya tersedia di versi web. Gunakan email & kata sandi untuk aplikasi mobile.');
      return;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!profileDoc.exists()) {
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Pengguna Google',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || undefined,
        level: 1,
        progress: 0,
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });
      setUserProfile(profile);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const profile: UserProfile = {
      uid: cred.user.uid,
      name,
      email,
      level: 1,
      progress: 0,
    };
    await setDoc(doc(db, 'users', cred.user.uid), {
      ...profile,
      createdAt: serverTimestamp(),
    });
    setUserProfile(profile);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, loginWithGoogle, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
