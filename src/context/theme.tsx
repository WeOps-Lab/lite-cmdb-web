'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { ThemeConfig } from 'antd/es/config-provider/context';
import { lightTheme, darkTheme } from '@/constants/theme'
import { useTranslation } from '@/utils/i18n';

const ThemeContext = createContext<{
  theme: ThemeConfig;
  setTheme: (isDark: boolean) => void;
    } | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
      document.documentElement.classList.add('dark');
    } else {
      setTheme(lightTheme);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const changeTheme = (isDark: boolean) => {
    const newTheme = isDark ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
      <ConfigProvider theme={theme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const { t } = useTranslation();
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(t('common.useThemeError'));
  }
  return context;
};
