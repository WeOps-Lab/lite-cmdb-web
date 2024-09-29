"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  AttrFieldType,
  crentialsAssoInstItem,
  crentialsAssoDetailItem,
  UserItem,
  Organization,
} from "@/types/assetManage";
import {
  convertArray,
  getAssetColumns,
  findAndFlattenAttrs,
} from "@/utils/common";
import CustomTable from "@/components/custom-table";
import { Spin, Collapse } from "antd";
import useApiClient from "@/utils/request";
import { CaretRightOutlined } from "@ant-design/icons";
import credentialsStyle from "./index.module.less";
import { useTranslation } from "@/utils/i18n";
import FieldModal from "@/app/credential/list/fieldModal";
import { CREDENTIAL_LIST } from "@/constants/asset";

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
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const [assoCredentials, setAssoCredentials] = useState<
    crentialsAssoInstItem[]
  >([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const { get, post, isLoading } = useApiClient();
  const modelId: string = searchParams.get("model_id") || "";
  const instId: string = searchParams.get("inst_id") || "";
  const fieldRef = useRef<FieldRef>(null);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const showAttrModal = (
    type: string,
    row = {},
    properties: AttrFieldType[]
  ) => {
    const title = type === "add" ? "Add" : "Edit";
    fieldRef.current?.showModal({
      title,
      type,
      attrList: properties,
      formInfo: row,
      subTitle: "",
      model_id: modelId,
      list: [],
    });
  };

  const getInitData = () => {
    const getUserList = get("/api/user_group/user_list/");
    const getGroupList = get("/api/user_group/group_list/");
    const getAssoInstList = post(
      `/api/credential/credential_association_inst_list/`,
      {
        instance_id: instId,
      }
    );
    setPageLoading(true);
    try {
      Promise.all([getUserList, getGroupList, getAssoInstList])
        .then((res) => {
          const userData: UserItem[] = res[0].users;
          const organizationData: Organization[] = convertArray(res[1]);
          setUserList(userData);
          setOrganizationList(organizationData);
          drawPage({
            userData,
            organizationData,
            instAssoCredentials: res[2],
          });
        })
        .catch(() => {
          setPageLoading(false);
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch (error) {
      setPageLoading(false);
    }
  };

  const drawPage = (config: {
    userData: UserItem[];
    organizationData: Organization[];
    instAssoCredentials: crentialsAssoDetailItem[];
  }) => {
    const { userData, organizationData, instAssoCredentials } = config;
    const assoCredentailList = instAssoCredentials
      .reduce((pre: any, cur: crentialsAssoDetailItem) => {
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
          userList: userData,
          groupList: organizationData,
          t,
        });
        if (columns[0]) {
          columns[0].fixed = "left";
          columns[0].render = (_: unknown, record: any) => (
            <a
              className="text-[var(--color-primary)]"
              onClick={() =>
                showAttrModal("edit", record, findAndFlattenAttrs(item.key))
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
              scroll={{ x: "calc(100vw - 300px)" }}
              rowKey="_id"
            />
          ),
        };
      });
    setAssoCredentials(assoCredentailList);
    setActiveKey(
      assoCredentailList.map((item: crentialsAssoInstItem) => item.key)
    );
  };

  const showCredentialName = (id: string) => {
    let name = "--";
    CREDENTIAL_LIST.forEach((item) => {
      const target = item.list.find((tex) => tex.model_id === id);
      if (target) {
        name = target.model_name || "--";
      }
    });
    return name;
  };

  const handleCollapseChange = (keys: any) => {
    setActiveKey(keys);
  };

  const getList = () => {
    console.log(123);
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
      <FieldModal ref={fieldRef} userList={userList} onSuccess={getList} />
    </Spin>
  );
};
export default Credentials;
