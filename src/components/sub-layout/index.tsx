import React from 'react';
import SideMenu, { MenuItem } from './side-menu';
import sideMenuStyle from './index.module.less';

interface WithSideMenuLayoutProps {
  menuItems: MenuItem[];
  intro?: React.ReactNode;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
  children: React.ReactNode;
  topSection?: React.ReactNode;
}

const WithSideMenuLayout: React.FC<WithSideMenuLayoutProps> = ({ 
  menuItems, 
  intro, 
  showBackButton, 
  onBackButtonClick, 
  children,
  topSection
}) => {
  return (
    <div className={`flex grow w-full ${sideMenuStyle.sideMenuLayout}`}>
      <SideMenu 
        menuItems={menuItems}
        showBackButton={showBackButton}
        onBackButtonClick={onBackButtonClick}
      >
        {intro}
      </SideMenu>
      <section className="flex-1 flex flex-col overflow-hidden">
        {topSection && (
          <div className={`mb-4 w-full rounded-md ${sideMenuStyle.sectionContainer}`}>
            {topSection}
          </div>
        )} 
        <div className={`p-4 flex-1 rounded-md overflow-auto ${sideMenuStyle.sectionContainer}`}>
          {children}
        </div>
      </section>
    </div>
  );
};

export default WithSideMenuLayout;