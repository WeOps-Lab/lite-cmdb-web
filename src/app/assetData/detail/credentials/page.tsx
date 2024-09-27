"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  AttrFieldType,
  crentialsAssoInstItem,
  crentialsAssoDetailItem,
  UserItem,
  Organization,
  ModelItem,
  InstDetail,
  AssoTypeItem,
} from "@/types/assetManage";
import { convertArray, getAssetColumns } from "@/utils/common";
import CustomTable from "@/components/custom-table";
import { Spin, Collapse, Button } from "antd";
import useApiClient from "@/utils/request";
import { CaretRightOutlined } from "@ant-design/icons";
import credentialsStyle from "./index.module.less";
import { useTranslation } from "@/utils/i18n";
import FieldModal from "@/app/credential/list/fieldModal";

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
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [activeKey, setActiveKey] = useState<string[]>([]);
  const [assoTypes, setAssoTypes] = useState<AssoTypeItem[]>([]);
  const [assoCredentials, setAssoCredentials] = useState<
    crentialsAssoInstItem[]
  >([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const { get, isLoading } = useApiClient();
  const modelId: string = searchParams.get("model_id") || "";
  const instId: string = searchParams.get("inst_id") || "";
  const fieldRef = useRef<FieldRef>(null);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const showAttrModal = (type: string, row = {}) => {
    if (type) return;
    const title = type === "add" ? "Add" : "Edit";
    fieldRef.current?.showModal({
      title,
      type,
      attrList: [],
      formInfo: row,
      subTitle: "",
      model_id: modelId,
      list: [],
    });
  };

  const getInitData = () => {
    const getUserList = get("/api/user_group/user_list/");
    const getGroupList = get("/api/user_group/group_list/");
    const getAssoInstList = get(
      `/api/instance/association_instance_list/${modelId}/${instId}/`
    );
    const getModelList = get("/api/model/");
    const getAssoType = get("/api/model/model_association_type/");
    const assoList = [
      {
        src_model_id: "host",
        model_asst_id: "mysql_connect_host",
        dst_model_id: "mysql",
        asst_id: "group",
        inst_list: [
          {
            inst_name: "hell",
            organization: [],
            host_id: "123",
            frequence: "10",
            system: 1,
            time_out: "2024-04-10 00:00:00",
            is_started: true,
            _id: "2",
          },
        ],
      },
      {
        src_model_id: "host",
        model_asst_id: "host_belong_oracle",
        dst_model_id: "oracle",
        asst_id: "belong",
        inst_list: [
          {
            inst_name: "tex",
            organization: [],
            host_id: "123",
            frequence: "10",
            system: 2,
            time_out: "2024-04-10 00:00:00",
            is_started: false,
            _id: "1",
          },
        ],
      },
    ];
    setPageLoading(true);
    try {
      Promise.all([
        getUserList,
        getGroupList,
        getAssoInstList,
        getModelList,
        getAssoType,
      ])
        .then((res) => {
          const userData: UserItem[] = res[0].users;
          const organizationData: Organization[] = convertArray(res[1]);
          setUserList(userData);
          setOrganizationList(organizationData);
          setModelList(res[3] || []);
          setAssoTypes(res[4] || []);
          Promise.all(
            assoList.map((item) =>
              getModelAttrList(item, {
                assoList,
                userData,
                organizationData,
                models: res[3],
                assoTypeList: res[4],
              })
            )
          ).finally(() => {
            setPageLoading(false);
          });
        })
        .catch(() => {
          setPageLoading(false);
        });
    } catch (error) {
      setPageLoading(false);
    }
  };

  const getModelAttrList = async (item: any, config: any) => {
    const responseData = await get(`/api/model/${getAttrId(item)}/attr_list/`);
    const targetIndex = config.assoList.findIndex(
      (assoItem: crentialsAssoDetailItem) =>
        assoItem.model_asst_id === item.model_asst_id
    );
    const columns = getAssetColumns({
      attrList: responseData,
      userList: config.userList,
      groupList: config.organizationList,
      t,
    });
    if (columns[0]) {
      columns[0].fixed = "left";
      columns[0].render = (_: unknown, record: any) => (
        <a onClick={() => showAttrModal("edit", record)}>
          {record[columns[0].dataIndex]}
        </a>
      );
    }
    if (targetIndex !== -1) {
      config.assoList[targetIndex] = {
        key: item.model_asst_id,
        label: showConnectName(item, config),
        model_asst_id: item.model_asst_id,
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
    }
    setAssoCredentials(config.assoList);
    setActiveKey(
      config.assoList.map((item: crentialsAssoDetailItem) => item.key)
    );
  };

  const showConnectName = (row: crentialsAssoDetailItem, config: any) => {
    const sourceName = showModelName(row.src_model_id, config.models);
    const targetName = showModelName(row.dst_model_id, config.models);
    const relation = showConnectType(row.asst_id, config.assoTypeList);
    return `${sourceName} ${relation} ${targetName}`;
  };

  const showModelName = (id: string, list: ModelItem[]) => {
    return list.find((item) => item.model_id === id)?.model_name || "--";
  };
  const showConnectType = (id: string, assoTypeList: AssoTypeItem[]) => {
    return assoTypeList.find((item) => item.asst_id === id)?.asst_name || "--";
  };

  const getAttrId = (item: crentialsAssoDetailItem) => {
    const { dst_model_id: dstModelId, src_model_id: srcModelId } = item;
    if (modelId === dstModelId) {
      return srcModelId;
    }
    return dstModelId;
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
