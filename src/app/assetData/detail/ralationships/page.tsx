"use client";
import React, { useEffect, useState, useRef } from "react";
import Icon from "@/components/icon";
import {
  UserItem,
  Organization,
  ModelItem,
  AssoTypeItem,
  AssoListRef,
} from "@/types/assetManage";
import { convertArray, filterNodesWithAllParents } from "@/utils/common";
import { Segmented, Button, Spin } from "antd";
import useApiClient from "@/utils/request";
import { GatewayOutlined } from "@ant-design/icons";
import ralationshipsStyle from "./index.module.less";
import { useTranslation } from "@/utils/i18n";
import AssoList from "./list";
import { useCommon } from "@/context/common";

const Ralationships = () => {
  const { t } = useTranslation();
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [isExpand, setIsExpand] = useState<boolean>(true);
  const [assoTypes, setAssoTypes] = useState<AssoTypeItem[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("list");
  const assoListRef = useRef<AssoListRef>(null);
  const { get, isLoading } = useApiClient();
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
    const getModelList = get("/api/model/");
    const getAssoType = get("/api/model/model_association_type/");
    setPageLoading(true);
    try {
      Promise.all([getUserList, getGroupList, getModelList, getAssoType]).then(
        (res) => {
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
          setUserList(userData);
          setOrganizationList(organizationData);
          setModelList(res[2] || []);
          setAssoTypes(res[3] || []);
        }
      );
    } finally {
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
              label: t("list"),
              value: "list",
            },
            {
              label: t("topo"),
              value: "topo",
            },
          ]}
          onChange={handleTabChange}
        />
        {activeTab === "list" && (
          <div className={ralationshipsStyle.operation}>
            <Button
              type="link"
              icon={<GatewayOutlined />}
              onClick={handleRelate}
            >
              {t("Model.AssociationManagement")}
            </Button>
            <div className={ralationshipsStyle.expand} onClick={handleExpand}>
              <Icon
                type={isExpand ? "a-yijianshouqi1" : "a-yijianzhankai1"}
              ></Icon>
              <span className={ralationshipsStyle.expandText}>
                {isExpand ? t("closeAll") : t("expandAll")}
              </span>
            </div>
          </div>
        )}
      </header>
      {activeTab === "list" ? (
        <AssoList
          ref={assoListRef}
          userList={userList}
          organizationList={organizationList}
          modelList={modelList}
          assoTypeList={assoTypes}
        />
      ) : (
        <div>拓扑图</div>
      )}
    </Spin>
  );
};

export default Ralationships;
