import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type UserProfile } from './supabase';
import { router } from 'expo-router';

interface AuthContextType {
  user: { id: string; email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile) {
            setUserProfile(profile);
          }
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        console.log('Error loading auth:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profile) {
          setUserProfile(profile);
        }
        router.replace('/(tabs)');
      } else {
        setUser(null);
        setUserProfile(null);
        router.replace('/(auth)/login');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          level: 1,
          progress: 0,
          is_online: false,
        });
      if (profileError) throw profileError;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
