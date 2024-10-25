import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';


interface PermissionsContextProps {
  permissions: Record<string, any> | null;
  loadPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextProps | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { get } = useApiClient();
  const [permissions, setPermissions] = useState<Record<string, any> | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const loadPermissions = useCallback(async () => {
    if (isLoaded) return;

    const useLocalPermissions = process.env.NEXT_PUBLIC_USE_LOCAL_PERMISSIONS === 'true';
    let fetchedPermissions: Record<string, any> = {};

    if (useLocalPermissions) {
      try {
        fetchedPermissions = await import('@/constants/permissions.json');
        console.log('fetchedPermissions:', fetchedPermissions);
        fetchedPermissions = fetchedPermissions.default || fetchedPermissions;
      } catch (error) {
        console.error(t('common.errorFetch'), error);
      }
    } else {
      try {
        const response = await get('/user/permission/');
        fetchedPermissions = await response.json();
      } catch (error) {
        console.error(t('common.errorFetch'), error);
      }
    }

    setPermissions(fetchedPermissions);
    setIsLoaded(true);
  }, [isLoaded]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  return (
    <PermissionsContext.Provider value={{ permissions, loadPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissionsContext = () => {
  const { t } = useTranslation();
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error(t('common.usePermissionsContextError'));
  }
  return context;
};