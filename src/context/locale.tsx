'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import enMessages from '@/locales/en/message.json';
import zhMessages from '@/locales/zh/message.json';
import flattenMessages from '@/utils/flattenMessage'

interface MessageContent {
  [key: string]: string | MessageContent;
}

interface Messages {
  [key: string]: MessageContent;
}

const messages: Messages = {
  en: enMessages,
  zh: zhMessages,
};

const LocaleContext = createContext<{
  locale: string;
  setLocale: (locale: string) => void;
    } | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale) {
      setLocale(savedLocale);
    }
  }, []);

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const localeMessage = flattenMessages(messages[locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale: changeLocale }}>
      <IntlProvider locale={locale} messages={localeMessage}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
