'use client';

import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import { useRouter } from 'next/navigation';
import { getIconUrl } from '@/utils/common';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import attrLayoutStyle from './layout.module.less';
import useApiClient from '@/utils/request';
import { ClassificationItem } from '@/types/assetManage';
import { useTranslation } from '@/utils/i18n';

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groupList, setGroupList] = useState<ClassificationItem[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const objIcon: string = searchParams.get('icn') || '';
  const modelName: string = searchParams.get('model_name') || '';
  const modelId: string = searchParams.get('model_id') || '';
  const { get, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const menuItems = [
    { label: t('Model.baseInfo'), path: '/assetData/detail/baseInfo' },
    {
      label: t('Model.relationships'),
      path: '/assetData/detail/ralationships',
    },
    {
      label: t('Model.changeRecords'),
      path: '/assetData/detail/changeRecords',
    },
    {
      label: t('Model.credentialManagement'),
      path: '/assetData/detail/credentials',
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    // getGroups();
  }, [isLoading, get]);

  const getGroups = async () => {
    setPageLoading(true);
    try {
      const data = await get('/api/classification/');
      setGroupList(data);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleBackButtonClick = () => {
    // 处理返回按钮点击事件
    router.push(`/assetData`);
  };

  const intro = (
    <header className="flex items-center">
      <Image
        src={getIconUrl({ icn: objIcon, model_id: modelId })}
        className="block mr-[10px]"
        alt={t('picture')}
        width={30}
        height={30}
      />
      <div className="flex flex-col mr-[10px]">
        <span className="text-[14px] font-[800] mb-[2px] ">{modelName}</span>
      </div>
    </header>
  );

  return (
    <div className={`flex flex-col ${attrLayoutStyle.attrLayout}`}>
      <Spin spinning={pageLoading}>
        <WithSideMenuLayout
          menuItems={menuItems}
          showBackButton={true}
          onBackButtonClick={handleBackButtonClick}
          intro={intro}
        >
          {children}
        </WithSideMenuLayout>
      </Spin>
    </div>
  );
};

export default AboutLayout;
