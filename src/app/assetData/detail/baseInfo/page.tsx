"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import List from "./list";
import {
  AttrFieldType,
  UserItem,
  Organization,
  InstDetail,
} from "@/types/assetManage";
import { convertArray, filterNodesWithAllParents } from "@/utils/common";
import { Spin } from "antd";
import useApiClient from "@/utils/request";
import { useCommon } from "@/context/common";

const BaseInfo = () => {
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [instDetail, setInstDetail] = useState<InstDetail>({});
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const { get, isLoading } = useApiClient();
  const modelId: string = searchParams.get("model_id") || "";
  const instId: string = searchParams.get("inst_id") || "";
  const commonContext = useCommon();
  const permissionGroupsInfo = commonContext?.permissionGroupsInfo || null;
  const groupsInfoRef = useRef(permissionGroupsInfo);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const getInitData = () => {
    const getUserList = get("/api/user_group/user_list/");
    const getGroupList = get("/api/user_group/group_list/");
    const getAttrList = get(`/api/model/${modelId}/attr_list/`);
    const getInstDetail = get(`/api/instance/${instId}/`);
    setPageLoading(true);
    try {
      Promise.all([getUserList, getGroupList, getAttrList, getInstDetail])
        .then((res) => {
          const userData: UserItem[] = res[0].users;
          const groupIds = groupsInfoRef.current?.group_ids || [];
          const isAdmin = groupsInfoRef.current?.is_all || false;
          const permissionOrganizations = filterNodesWithAllParents(
            res[1],
            groupIds
          );
          const organizationData: Organization[] = convertArray(
            isAdmin ? res[1] : permissionOrganizations
          );
          const propertData: AttrFieldType[] = res[2];
          const instDetail: InstDetail = res[3];
          setUserList(userData);
          setOrganizationList(organizationData);
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
