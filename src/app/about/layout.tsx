'use client';

import React from 'react';
import WithSideMenuLayout from '@/components/sub-layout';

const menuItems = [
  { label: 'Document', path: '/about/document', icon: 'shiyongwendang' },
  { label: 'System', path: '/about/system', icon: 'shezhi' },
];

const intro = (
  <div>
    <h2 className="text-lg font-semibold">Menu Introduction</h2>
    <p className="text-sm">This is a brief introduction about the menu.</p>
  </div>
);

const handleBackButtonClick = () => {
  // 处理返回按钮点击事件
  console.log('Back button clicked');
};

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <WithSideMenuLayout
      menuItems={menuItems}
      intro={intro}
      showBackButton={true}
      onBackButtonClick={handleBackButtonClick}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default AboutLayout;