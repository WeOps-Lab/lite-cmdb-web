'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { usePermissionsContext } from '@/context/permission';

const usePermissions = () => {
  const { data: session, status } = useSession();
  const currentPath = usePathname();
  const { permissions, loadPermissions } = usePermissionsContext();

  const getFirstLayerOfPath = (path: string) => {
    if (!path) return '';
    const pathSegments = path.split('/');
    return pathSegments.length > 1 ? `/${pathSegments[1]}` : path;
  };

  useEffect(() => {
    if (!permissions) {
      loadPermissions();
    }
  }, [permissions, loadPermissions]);

  if (status === 'loading' || !session || permissions === null) {
    return { hasPermission: () => false };
  }

  const roles = session?.roles || [];
  const firstLayerPath = getFirstLayerOfPath(currentPath);

  const hasPermission = (requiredPermissions: string[]): boolean => {
    const routePermissions = permissions[firstLayerPath] || {};
    console.log('firstLayerPath', firstLayerPath);

    const userPermissions = new Set<string>();

    roles.forEach(role => {
      routePermissions[role]?.forEach((permission: string) => {
        userPermissions.add(permission);
      });
    });

    return requiredPermissions.every(permission => userPermissions.has(permission));
  };

  return { hasPermission };
};

export default usePermissions;