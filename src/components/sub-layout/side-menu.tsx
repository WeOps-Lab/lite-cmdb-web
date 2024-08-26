'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import sideMenuStyle from './index.module.less';
import { ArrowLeftOutlined } from '@ant-design/icons';

export interface MenuItem {
  label: string;
  path: string;
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

  return (
    <aside className={`w-[216px] pr-4 flex flex-col h-full ${sideMenuStyle.sideMenu}`}>
      {children && (
        <div className={`p-4 rounded-md mb-3 ${sideMenuStyle.introduction}`}>
          {children}
        </div>
      )}
      <nav className={`flex-1 relative rounded-md ${sideMenuStyle.nav}`}>
        <ul className="p-3">
          {menuItems.map((item) => (
            <li key={item.path} className={`rounded-md mb-1 ${pathname === item.path ? sideMenuStyle.active : ''}`}>
              <Link legacyBehavior href={item.path}>
                <a className={`group flex items-center h-9 rounded-md py-2 text-sm font-normal px-3`}>{item.label}</a>
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
