'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AttrFieldType,
  CrentialsAssoInstItem,
  CrentialsAssoDetailItem,
  UserItem,
  Organization,
} from '@/types/assetManage';
import { getAssetColumns, findAndFlattenAttrs } from '@/utils/common';
import CustomTable from '@/components/custom-table';
import { Spin, Collapse } from 'antd';
import useApiClient from '@/utils/request';
import { useCommon } from '@/context/common';
import { CaretRightOutlined } from '@ant-design/icons';
import credentialsStyle from './index.module.less';
import { useTranslation } from '@/utils/i18n';
import FieldModal from '@/app/credential/list/fieldModal';
import { CREDENTIAL_LIST } from '@/constants/asset';

interface FieldRef {
  showModal: (config: FieldConfig) => void;
}
interface FieldConfig {
  type: string;
  attrList: AttrFieldType[];
  formInfo: any;
  subTitle: string;
  title: string;
  model_id: string;
  list: Array<any>;
}

const Credentials = () => {
  const { t } = useTranslation();
  const { post, isLoading } = useApiClient();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.organizations || []);
  const organizationList: Organization[] = authList.current;
  const users = useRef(commonContext?.userList || []);
  const fieldRef = useRef<FieldRef>(null);
  const userList: UserItem[] = users.current;
  const searchParams = useSearchParams();
  const modelId: string = searchParams.get('model_id') || '';
  const instId: string = searchParams.get('inst_id') || '';
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const [assoCredentials, setAssoCredentials] = useState<
    CrentialsAssoInstItem[]
  >([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const showAttrModal = (
    type: string,
    row = {},
    properties: AttrFieldType[]
  ) => {
    fieldRef.current?.showModal({
      title: 'Detail',
      type,
      attrList: properties,
      formInfo: row,
      subTitle: '',
      model_id: modelId,
      list: [],
    });
  };

  const getInitData = async () => {
    setPageLoading(true);
    try {
      const lists = await post(
        `/api/credential/credential_association_inst_list/`,
        {
          instance_id: instId,
        }
      );
      drawPage(lists);
    } finally {
      setPageLoading(false);
    }
  };

  const drawPage = (instAssoCredentials: CrentialsAssoDetailItem[]) => {
    const assoCredentailList = instAssoCredentials
      .reduce((pre: any, cur: CrentialsAssoDetailItem) => {
        const target = pre.find(
          (item: any) => item.key === cur.credential_type
        );
        if (!target) {
          pre.push({
            key: cur.credential_type,
            label: showCredentialName(cur.credential_type),
            inst_list: [cur],
          });
        } else {
          target.inst_list.push(cur);
        }
        return pre;
      }, [])
      .map((item: any) => {
        const columns = getAssetColumns({
          attrList: findAndFlattenAttrs(item.key),
          userList,
          groupList: organizationList,
          t,
        });
        if (columns[0]) {
          columns[0].fixed = 'left';
          columns[0].render = (_: unknown, record: any) => (
            <a
              className="text-[var(--color-primary)]"
              onClick={() =>
                showAttrModal('detail', record, getFiledAttrs(item.key))
              }
            >
              {record[columns[0].dataIndex]}
            </a>
          );
        }
        return {
          ...item,
          children: (
            <CustomTable
              pagination={false}
              dataSource={item.inst_list}
              columns={columns}
              scroll={{ x: 'calc(100vw - 300px)' }}
              rowKey="_id"
            />
          ),
        };
      });
    setAssoCredentials(assoCredentailList);
    setActiveKey(
      assoCredentailList.map((item: CrentialsAssoInstItem) => item.key)
    );
  };

  const showCredentialName = (id: string) => {
    let name = '--';
    CREDENTIAL_LIST.forEach((item) => {
      const target = item.list.find((tex) => tex.model_id === id);
      if (target) {
        name = target.model_name || '--';
      }
    });
    return name;
  };

  const getFiledAttrs = (id: string) => {
    let list: any[] = [];
    CREDENTIAL_LIST.forEach((item) => {
      const target = item.list.find((tex) => tex.model_id === id);
      if (target) {
        list = target.attrs || [];
      }
    });
    return list;
  };

  const handleCollapseChange = (keys: any) => {
    setActiveKey(keys);
  };

  return (
    <Spin spinning={pageLoading}>
      <div className={credentialsStyle.credentials}>
        <Collapse
          bordered={false}
          activeKey={activeKey}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          items={assoCredentials}
          onChange={handleCollapseChange}
        />
      </div>
      <FieldModal ref={fieldRef} userList={userList} />
    </Spin>
  );
};
export default Credentials;
