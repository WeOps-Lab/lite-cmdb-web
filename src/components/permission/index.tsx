import React from 'react';
import { Tooltip } from 'antd';
import usePermissions from '@/hooks/usePermissions';

interface PermissionWrapperProps {
  requiredPermissions: string[];
  fallback?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

const PermissionWrapper: React.FC<React.PropsWithChildren<PermissionWrapperProps>> = ({
  requiredPermissions,
  fallback = null,
  tooltip = "暂无权限",
  className,
  children
}) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(requiredPermissions)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Tooltip title={tooltip}>
      <span
        className={className}
        style={{ display: 'inline-block', cursor: 'not-allowed' }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ pointerEvents: 'none', opacity: 0.5 }}>
          {fallback || children}
        </span>
      </span>
    </Tooltip>
  );
};

export default PermissionWrapper;