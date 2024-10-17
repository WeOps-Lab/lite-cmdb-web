import React, { useState } from 'react';
import { Dropdown, Space, Menu, Avatar } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { DownOutlined } from '@ant-design/icons';
import SettingsModal from './settings';

const UserInfo = () => {
  const { data: session } = useSession();
  const username = session?.username || 'Qiu-Jia';
  const [visible, setVisible] = useState<boolean>(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleSettings = () => {
    setVisible(true);
  };

  const items: Array<{ label: JSX.Element; key: string } | { type: 'divider' }> = [
    {
      label: <a onClick={handleSettings}>Settings</a>,
      key: '0',
    },
    {
      type: 'divider',
    },
    {
      label: <a onClick={handleLogout}>Logout</a>,
      key: '1',
    },
  ];

  return (
    <div>
      {username && (
        <Dropdown overlay={<Menu items={items} />} trigger={['click']}>
          <a className='cursor-pointer' onClick={(e) => e.preventDefault()}>
            <Space className='text-sm'>
              <Avatar 
                size={20}
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  verticalAlign: 'middle' 
                }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
              {username}
              <DownOutlined style={{ fontSize: '10px' }} />
            </Space>
          </a>
        </Dropdown>
      )}
      <SettingsModal 
        visible={visible} 
        onClose={() => setVisible(false)} />
    </div>
  );
};

export default UserInfo;
