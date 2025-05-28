'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient, User, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
          console.log(`[AuthContext] Auth state changed: ${event}`, newSession?.user?.id);
          setSession(newSession);
          setUser(newSession?.user || null);
          
          if (event === 'SIGNED_OUT') {
            // Handle sign out by redirecting to login
            if (!pathname.startsWith('/auth/')) {
              router.push('/auth/login');
            }
          } else if (event === 'SIGNED_IN') {
            // Handle sign in by refreshing to get latest data
            router.refresh();
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[AuthContext] Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();
  }, [supabase, router, pathname]);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/auth/login');
    },
    refresh: async () => {
      setIsLoading(true);
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      setSession(refreshedSession);
      setUser(refreshedSession?.user || null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};