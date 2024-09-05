import React from 'react';
import { Tabs } from 'antd';
import ThemeSwitcher from '../theme-switcher';
import LanguageSwitcher from '../language-switcher';
import OperateModal from '../operate-modal'

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
    <OperateModal
      title="Settings"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </OperateModal>
  );
};

export default SettingsModal;
