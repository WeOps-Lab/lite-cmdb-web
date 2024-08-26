import React from 'react';
import SideMenu, { MenuItem } from './side-menu';
import sideMenuStyle from './index.module.less';

interface WithSideMenuLayoutProps {
  menuItems: MenuItem[];
  intro?: React.ReactNode;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
  children: React.ReactNode;
}

const WithSideMenuLayout: React.FC<WithSideMenuLayoutProps> = ({ 
  menuItems, 
  intro, 
  showBackButton, 
  onBackButtonClick, 
  children
}) => {
  return (
    <div className={`flex grow ${sideMenuStyle.sideMenuLayout}`}>
      <SideMenu 
        menuItems={menuItems}
        showBackButton={showBackButton}
        onBackButtonClick={onBackButtonClick}
      >
        {intro}
      </SideMenu>
      <section className="p-4 flex-1">
        {children}
      </section>
    </div>
  );
};

export default WithSideMenuLayout;
