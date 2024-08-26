import React from 'react';
import { Modal, Tabs } from 'antd';
import ThemeSwitcher from '../theme-switcher';
import LanguageSwitcher from '../language-switcher';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsDrawerProps> = ({
  visible,
  onClose,
}) => {
  const items = [
    {
      key: '1',
      label: 'Theme Settings',
      children: (
        <div className="space-y-4">
          <ThemeSwitcher />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Language Settings',
      children: (
        <div className="space-y-4">
          <LanguageSwitcher />
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="Settings"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Modal>
  );
};

export default SettingsModal;
