'use client';

import React from 'react';
import PermissionWrapper from '@/components/permission';
import Icon from '@/components/icon';

const DocumentPage = () => {
  const handleSettingsClick = () => {
    console.log('click');
  };

  return (
    <div>
      <h1>Document Pageqee</h1>
      <p>This is the document page.</p>
      <PermissionWrapper
        requiredPermissions={['write']}
      >
        <button onClick={handleSettingsClick}>
          <Icon type="shezhi" className="text-base" />
        </button>
      </PermissionWrapper>
    </div>
  );
};

export default DocumentPage;
