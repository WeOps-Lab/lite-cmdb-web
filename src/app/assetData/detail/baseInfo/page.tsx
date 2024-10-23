'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import List from './list';
import {
  AttrFieldType,
  UserItem,
  Organization,
  InstDetail,
} from '@/types/assetManage';
import { Spin } from 'antd';
import useApiClient from '@/utils/request';
import { useCommon } from '@/context/common';

const BaseInfo = () => {
  const { get, isLoading } = useApiClient();
  const searchParams = useSearchParams();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const users = useRef(commonContext?.userList || []);
  const userList: UserItem[] = users.current;
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);

  const modelId: string = searchParams.get('model_id') || '';
  const instId: string = searchParams.get('inst_id') || '';
  const [instDetail, setInstDetail] = useState<InstDetail>({});
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const getInitData = () => {
    const getAttrList = get(`/api/model/${modelId}/attr_list/`);
    const getInstDetail = get(`/api/instance/${instId}/`);
    setPageLoading(true);
    try {
      Promise.all([getAttrList, getInstDetail])
        .then((res) => {
          const propertData: AttrFieldType[] = res[0];
          const instDetail: InstDetail = res[1];
          setPropertyList(propertData);
          setInstDetail(instDetail);
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch (error) {
      setPageLoading(false);
    }
  };

  const onsuccessEdit = async () => {
    setPageLoading(true);
    try {
      await get(`/api/instance/${instId}/`);
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <Spin spinning={pageLoading}>
      <List
        instDetail={instDetail}
        propertyList={propertyList}
        userList={userList}
        organizationList={organizationList}
        onsuccessEdit={onsuccessEdit}
      />
    </Spin>
  );
};
export default BaseInfo;
