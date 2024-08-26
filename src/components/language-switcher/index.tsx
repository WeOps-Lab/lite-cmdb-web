'use client';

import { Select } from 'antd';
import { useLocale } from '@/context/locale';

const { Option } = Select;

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();

  return (
    <Select value={locale} onChange={setLocale}>
      <Option value="en">English</Option>
      <Option value="zh">中文</Option>
    </Select>
  );
}

export default LanguageSwitcher;
