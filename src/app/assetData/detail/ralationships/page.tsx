'use client';
import React, { useEffect, useState, useRef } from 'react';
import Icon from '@/components/icon';
import {
  UserItem,
  Organization,
  ModelItem,
  AssoTypeItem,
  AssoListRef,
} from '@/types/assetManage';
import { Segmented, Button, Spin } from 'antd';
import useApiClient from '@/utils/request';
import { GatewayOutlined } from '@ant-design/icons';
import ralationshipsStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import AssoList from './list';
import Topo from './topo';
import { useCommon } from '@/context/common';
import { useSearchParams } from 'next/navigation';

const Ralationships = () => {
  const { t } = useTranslation();
  const { get, isLoading } = useApiClient();
  const commonContext = useCommon();
  const searchParams = useSearchParams();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const users = useRef(commonContext?.userList || []);
  const userList: UserItem[] = users.current;
  const assoListRef = useRef<AssoListRef>(null);
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [isExpand, setIsExpand] = useState<boolean>(true);
  const [assoTypes, setAssoTypes] = useState<AssoTypeItem[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('list');
  const modelId: string = searchParams.get('model_id') || '';
  const instId: string = searchParams.get('inst_id') || '';

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const getInitData = () => {
    const getModelList = get('/api/model/');
    const getAssoType = get('/api/model/model_association_type/');
    setPageLoading(true);
    try {
      Promise.all([getModelList, getAssoType])
        .then((res) => {
          setModelList(res[0] || []);
          setAssoTypes(res[1] || []);
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch {
      setPageLoading(false);
    }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setIsExpand(true);
  };

  const handleExpand = () => {
    assoListRef.current?.expandAll(!isExpand);
    setIsExpand(!isExpand);
  };

  const handleRelate = () => {
    assoListRef.current?.showRelateModal();
  };

  return (
    <Spin spinning={pageLoading}>
      <header className={ralationshipsStyle.header}>
        <Segmented
          className="mb-[10px]"
          value={activeTab}
          options={[
            {
              label: t('list'),
              value: 'list',
            },
            {
              label: t('topo'),
              value: 'topo',
            },
          ]}
          onChange={handleTabChange}
        />
        {activeTab === 'list' && (
          <div className={ralationshipsStyle.operation}>
            <Button
              type="link"
              icon={<GatewayOutlined />}
              onClick={handleRelate}
            >
              {t('Model.AssociationManagement')}
            </Button>
            <div className={ralationshipsStyle.expand} onClick={handleExpand}>
              <Icon
                type={isExpand ? 'a-yijianshouqi1' : 'a-yijianzhankai1'}
              ></Icon>
              <span className={ralationshipsStyle.expandText}>
                {isExpand ? t('closeAll') : t('expandAll')}
              </span>
            </div>
          </div>
        )}
      </header>
      {activeTab === 'list' ? (
        <AssoList
          ref={assoListRef}
          userList={userList}
          organizationList={organizationList}
          modelList={modelList}
          assoTypeList={assoTypes}
        />
      ) : (
        <Topo
          assoTypeList={assoTypes}
          modelList={modelList}
          modelId={modelId}
          instId={instId}
        />
      )}
    </Spin>
  );
};

export default Ralationships;
