"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Space,
  Modal,
  Radio,
  Tabs,
  message,
  Spin,
  TablePaginationConfig,
  Input,
} from "antd";
import CustomTable from "@/components/custom-table";
import { PlusOutlined } from "@ant-design/icons";
import type { RadioChangeEvent } from "antd";
import assetDataStyle from "./index.module.less";
import FieldModal from "./list/fieldModal";
import SelectInstance from "./list/selectInstance";
import { useTranslation } from "@/utils/i18n";
import useApiClient from "@/utils/request";
const { confirm } = Modal;
import {
  ColumnItem,
  UserItem,
  AttrFieldType,
  Organization,
  ModelItem,
} from "@/types/assetManage";
import { convertArray } from "@/utils/common";
import { CREDENTIAL_LIST } from "@/constants/asset";

interface ModelTabs {
  key: string;
  label: string;
  attrs: AttrFieldType[];
}
interface FieldRef {
  showModal: (config: FieldConfig) => void;
}
interface SelectInstanceRef {
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

const Credential = () => {
  const fieldRef = useRef<FieldRef>(null);
  const selectInstanceRef = useRef<SelectInstanceRef>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [groupId, setGroupId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [modelList, setModelList] = useState<ModelTabs[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [instanceModels, setInstanceModels] = useState<ModelItem[]>([]);
  const [crendentialModels, setCrendentialModels] = useState<ModelItem[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [searchText, setSearchText] = useState<string>("");
  const { t } = useTranslation();
  const { get, del, isLoading } = useApiClient();
  const currentColumns: ColumnItem[] = [
    {
      title: t("name"),
      key: "name",
      dataIndex: "name",
    },
    {
      title: t("creator"),
      key: "_creator",
      dataIndex: "_creator",
    },
    {
      title: t("updateTime"),
      key: "update_time",
      dataIndex: "update_time",
    },
    {
      title: t("action"),
      key: "action",
      dataIndex: "action",
      render: (_: unknown, record: any) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => showAttrModal("edit", record)}
          >
            {t("edit")}
          </Button>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => showSelectInstanceModal(record)}
          >
            {t("Model.association")}
          </Button>
          <Button type="link" onClick={() => showDeleteConfirm(record)}>
            {t("delete")}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    initPage();
  }, [get, isLoading]);

  useEffect(() => {
    if (modelId) {
      fetchData();
    }
  }, [pagination?.current, pagination?.pageSize]);

  useEffect(() => {
    if (instanceModels.length && modelId) {
      CREDENTIAL_LIST.forEach((item) => {
        const target = item.list.find((tex) => tex.model_id === modelId);
        if (target) {
          setCrendentialModels(
            instanceModels.filter((model) =>
              target.assoModelIds.includes(model.model_id)
            )
          );
        }
      });
    }
  }, [instanceModels, modelId]);

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    pagination.current = 1;
    setPagination(pagination);
    fetchData();
  };

  const onTxtClear = () => {
    pagination.current = 1;
    setPagination(pagination);
    fetchData();
  };

  const fetchData = async (requestParams?: any) => {
    setTableLoading(true);
    let params = getTableParams();
    params.credential_type = modelId;
    if (requestParams) {
      params = requestParams;
    }
    try {
      const data = await get(`/api/credential/`, {
        params,
      });
      setTableData(data.items);
      pagination.total = data.count;
      setPagination(pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  const initPage = () => {
    const defaultGroupId = CREDENTIAL_LIST[0].classification_id;
    setGroupId(defaultGroupId);
    const _modelList = CREDENTIAL_LIST.filter(
      (item) => item.classification_id === defaultGroupId
    )[0].list.map((item) => ({
      key: item.model_id,
      label: item.model_name,
      attrs: item.attrs,
    }));
    const defaultModelId = _modelList[0].key;
    const properties =
      _modelList.find((item) => item.key === defaultModelId)?.attrs || [];
    setPropertyList(properties);
    setModelList(_modelList);
    setModelId(defaultModelId);
    const params = getTableParams();
    params.credential_type = defaultModelId;
    const getUserList = get("/api/user_group/user_list/");
    const getCredentialList = get("/api/credential/", {
      params,
    });
    const getOrganizationList = get("/api/user_group/group_list/");
    const getModelList = get("/api/model/");
    setLoading(true);
    try {
      Promise.all([
        getUserList,
        getCredentialList,
        getOrganizationList,
        getModelList,
      ])
        .then((res) => {
          const userData: UserItem[] = res[0].users;
          const organizationData: Organization[] = convertArray(res[2]);
          pagination.total = res[1].count;
          const tableList = res[1].items;
          setInstanceModels(res[3]);
          setOrganizationList(organizationData);
          setUserList(userData);
          setTableData(tableList);
          setPagination(pagination);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const getTableParams = () => {
    return {
      page: pagination.current,
      page_size: pagination.pageSize,
      credential_type: modelId,
      name: searchText,
    };
  };

  const getTableList = async (id: string, list?: ModelTabs[]) => {
    const properties =
      (list || modelList).find((item) => item.key === id)?.attrs || [];
    setPropertyList(properties);
    const tableParmas = getTableParams();
    const params = {
      ...tableParmas,
      credential_type: id,
    };
    fetchData(params);
  };

  const onSelectChange = (selectedKeys: any) => {
    setSelectedRowKeys(selectedKeys);
  };

  const onChangeModel = (key: string) => {
    setModelId(key);
    getTableList(key);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onGroupChange = (e: RadioChangeEvent) => {
    const currentGroupId = e.target.value;
    setGroupId(currentGroupId);
    const currentModelList = (
      CREDENTIAL_LIST.find((item) => item.classification_id === currentGroupId)
        ?.list || []
    ).map((item) => ({
      key: item.model_id,
      label: item.model_name,
      attrs: item.attrs,
    }));
    const currentModelId = currentModelList[0].key;
    setModelList(currentModelList);
    setModelId(currentModelId);
    getTableList(currentModelId, currentModelList);
  };

  const showDeleteConfirm = (row: any) => {
    const params = {
      ids: Array.isArray(row) ? row.join(",") : row._id,
    };
    confirm({
      title: t("deleteTitle"),
      content: t("deleteContent"),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/credential/batch_delete/`, {
              params,
            });
            message.success(t("successfullyDeleted"));
            if (pagination?.current) {
              pagination.current > 1 &&
                tableData.length === 1 &&
                pagination.current--;
            }
            setSelectedRowKeys([]);
            fetchData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const updateFieldList = () => {
    fetchData();
  };

  const showAttrModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add" : "Edit";
    fieldRef.current?.showModal({
      title,
      type,
      attrList: propertyList,
      formInfo: row,
      subTitle: "",
      model_id: modelId,
      list: selectedRowKeys,
    });
  };

  const showSelectInstanceModal = (row = {}) => {
    selectInstanceRef.current?.showModal({
      title: t("Model.selectInstance"),
      type: "",
      attrList: propertyList,
      formInfo: row,
      subTitle: "",
      model_id: modelId,
      list: selectedRowKeys,
    });
  };

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  return (
    <Spin spinning={loading} wrapperClassName={assetDataStyle.assetLoading}>
      <div className={assetDataStyle.assetData}>
        <div className={`mb-[20px] ${assetDataStyle.groupSelector}`}>
          <Radio.Group
            onChange={onGroupChange}
            value={groupId}
            buttonStyle="solid"
          >
            {CREDENTIAL_LIST.map((item) => (
              <Radio.Button
                key={item.classification_id}
                value={item.classification_id}
              >
                {item.classification_name}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
        <div className={assetDataStyle.assetList}>
          <Tabs
            defaultActiveKey={modelId}
            items={modelList}
            onChange={onChangeModel}
          />
          <div className="flex justify-between mb-4">
            <Input
              style={{
                width: "240px",
              }}
              placeholder={t("search")}
              value={searchText}
              allowClear
              onChange={onSearchTxtChange}
              onPressEnter={onTxtPressEnter}
              onClear={onTxtClear}
            />
            <Space>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => showAttrModal("add")}
              >
                {t("add")}
              </Button>
              <Button
                onClick={() => showDeleteConfirm(selectedRowKeys)}
                disabled={!selectedRowKeys.length}
              >
                {t("delete")}
              </Button>
            </Space>
          </div>
          <CustomTable
            rowSelection={rowSelection}
            dataSource={tableData}
            columns={currentColumns}
            pagination={pagination}
            loading={tableLoading}
            rowKey="_id"
            onChange={handleTableChange}
          />
          <FieldModal
            ref={fieldRef}
            userList={userList}
            onSuccess={updateFieldList}
          />
          <SelectInstance
            ref={selectInstanceRef}
            userList={userList}
            organizationList={organizationList}
            instanceModels={crendentialModels}
            onSuccess={updateFieldList}
          />
        </div>
      </div>
    </Spin>
  );
};

export default Credential;
