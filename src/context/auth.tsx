'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    console.log('session:', session);
    if (!session) {
      signIn('keycloak');
      return;
    }
    if (session?.accessToken) {
      setToken(session.accessToken);
      setIsAuthenticated(true);
      const userLocale = session.locale || 'en';
      localStorage.setItem('locale', userLocale);
      setIsAuthenticated(true);
    } else {
      console.warn(t('common.noAccessToken'));
    }
  }, [session, status, router]);

  if (status === 'loading' || !isAuthenticated) {
    return (
      <div className='first-loader-wrapper'>
        <div className='loading-arc'></div>
        <h1><span>LOADING</span></h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;