'use client';

import { Switch } from 'antd';
import { useTheme } from '@/context/theme';

const ThemeSwitcher = () => {
  const { setTheme } = useTheme();

  const handleChange = (checked: boolean) => {
    setTheme(checked);
  };

  return (
    <Switch size="small" onChange={handleChange} />
  );
}

export default ThemeSwitcher;
