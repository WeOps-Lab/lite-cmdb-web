'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import sideMenuStyle from './index.module.less';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Icon from '@/components/icon';

export interface MenuItem {
  label: string;
  path: string;
  icon?: string;
}

interface SideMenuProps {
  menuItems: MenuItem[];
  children?: React.ReactNode;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ 
  menuItems, 
  children, 
  showBackButton = true, 
  onBackButtonClick 
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildUrlWithParams = (path: string) => {
    const params = new URLSearchParams(searchParams);
    return `${path}?${params.toString()}`;
  };

  const isActive = (path: string): boolean => {
    // 判断当前路径是否以菜单项的路径开头
    return pathname.startsWith(path);
  };

  return (
    <aside className={`w-[216px] pr-4 flex flex-shrink-0 flex-col h-full ${sideMenuStyle.sideMenu}`}>
      {children && (
        <div className={`p-4 rounded-md mb-3 ${sideMenuStyle.introduction}`}>
          {children}
        </div>
      )}
      <nav className={`flex-1 relative rounded-md ${sideMenuStyle.nav}`}>
        <ul className="p-3">
          {menuItems.map((item) => (
            <li key={item.path} className={`rounded-md mb-1 ${isActive(item.path) ? sideMenuStyle.active : ''}`}>
              <Link legacyBehavior href={buildUrlWithParams(item.path)}>
                <a className={`group flex items-center h-9 rounded-md py-2 text-sm font-normal px-3`}>
                  {item.icon && <Icon type={item.icon} className="text-xl pr-1.5" />}
                  {item.label}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        {showBackButton && (
          <button
            className="absolute bottom-4 left-4 flex items-center py-2 rounded-md text-sm"
            onClick={onBackButtonClick}
          >
            <ArrowLeftOutlined className="mr-2" />
          </button>
        )}
      </nav>
    </aside>
  );
};

export default SideMenu;