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
} from "antd";
import CustomTable from "@/components/custom-table";
import SearchFilter from "./list/searchFilter"; // 导入新组件
import { PlusOutlined } from "@ant-design/icons";
import type { RadioChangeEvent } from "antd";
import assetDataStyle from "./index.module.less";
import FieldModal from "./list/fieldModal";
import { useTranslation } from "@/utils/i18n";
import useApiClient from "@/utils/request";
const { confirm } = Modal;
import { deepClone, getAssetColumns, convertArray } from "@/utils/common";
import {
  GroupItem,
  ModelItem,
  ColumnItem,
  UserItem,
  Organization,
  AttrFieldType,
} from "@/types/assetManage";

interface ModelTabs {
  key: string;
  label: string;
}

interface FieldRef {
  showModal: (config: FieldConfig) => void; // 你可以根据实际情况定义更多方法或属性
}

interface FieldConfig {
  type: string;
  attrList: AttrFieldType[];
  formInfo: unknown;
  subTitle: string;
  title: string;
}

const AssetData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const fieldRef = useRef<FieldRef>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [modelGroup, setModelGroup] = useState<GroupItem[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [modelList, setModelList] = useState<ModelTabs[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [queryList, setQueryList] = useState<unknown>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const { t } = useTranslation();
  const { get, del, post, isLoading } = useApiClient();

  useEffect(() => {
    if (isLoading) return;
    getModelGroup();
  }, [get, isLoading]);

  useEffect(() => {
    if (modelId) {
      fetchData();
    }
  }, [pagination?.current, pagination?.pageSize, queryList]);

  const fetchData = async () => {
    setTableLoading(true);
    const params = getTableParams();
    try {
      const data = await post(`/api/instance/search/`, params);
      setTableData(data.insts);
      pagination.total = data.count;
      setPagination(pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  const getModelGroup = () => {
    const getCroupList = get("/api/classification/");
    const getModelList = get("/api/model/");
    const getUserList = get("/api/user_group/user_list/");
    const getGroupList = get("/api/user_group/group_list/");
    setLoading(true);
    try {
      Promise.all([getModelList, getCroupList, getUserList, getGroupList])
        .then((res) => {
          const modeldata: ModelItem[] = res[0];
          const groupData: GroupItem[] = res[1];
          const userData: UserItem[] = res[2].users;
          const organizationData: Organization[] = convertArray(res[3]);
          setUserList(userData);
          setOrganizationList(organizationData);
          const groups = deepClone(groupData).map((item: GroupItem) => ({
            ...item,
            list: [],
            count: 0,
          }));
          modeldata.forEach((modelItem: ModelItem) => {
            const target = groups.find(
              (item: GroupItem) =>
                item.classification_id === modelItem.classification_id
            );
            if (target) {
              target.list.push(modelItem);
              target.count++;
            }
          });
          const defaultGroupId = groupData[0].classification_id;
          setGroupId(defaultGroupId);
          setModelGroup(groups);
          const _modelList = modeldata
            .filter((item) => item.classification_id === defaultGroupId)
            .map((item) => ({
              key: item.model_id,
              label: item.model_name,
            }));
          const defaultModelId = _modelList[0].key;
          setModelList(_modelList);
          setModelId(defaultModelId);
          getInitData(defaultModelId);
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
      query_list: queryList ? [queryList] : [],
      page: pagination.current,
      page_size: pagination.pageSize,
      order: "",
      model_id: modelId,
      role: "",
    };
  };

  const getInitData = (id: string) => {
    const tableParmas = getTableParams();
    const getAttrList = get(`/api/model/${id}/attr_list/`);
    const getInstList = post("/api/instance/search/", {
      ...tableParmas,
      model_id: id,
    });
    setLoading(true);
    try {
      Promise.all([getAttrList, getInstList])
        .then((res) => {
          const attrList = getAssetColumns({
            attrList: res[0],
            userList,
            groupList: organizationList,
            t,
          });
          const tableList = res[1].insts;
          setTableData(tableList);
          setPropertyList(res[0]);
          pagination.total = res[1].count;
          setPagination(pagination);
          setColumns([
            ...attrList,
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
                  <Button type="link" onClick={() => showDeleteConfirm(record)}>
                    {t("delete")}
                  </Button>
                </>
              ),
            },
          ]);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const onSelectChange = (selectedKeys: any) => {
    setSelectedRowKeys(selectedKeys);
  };

  const onChangeModel = (key: string) => {
    setModelId(key);
    getInitData(key);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleDelete = () => {
    confirm({
      title: t("batchDeleteTitle"),
      onOk: () => {
        message.success(t("successfullyDeleted"));
        setSelectedRowKeys([]);
      },
    });
  };

  const onGroupChange = (e: RadioChangeEvent) => {
    const currentGroupId = e.target.value;
    setGroupId(currentGroupId);
    const currentModelList = (
      modelGroup.find((item) => item.classification_id === currentGroupId)
        ?.list || []
    ).map((item) => ({
      key: item.model_id,
      label: item.model_name,
    }));
    const currentModelId = currentModelList[0].key;
    setModelList(currentModelList);
    setModelId(currentModelId);
    getInitData(currentModelId);
  };

  const showDeleteConfirm = (row = {}) => {
    confirm({
      title: t("deleteTitle"),
      content: t("deleteContent"),
      centered: true,
      onOk() {
        return new Promise((resolve) => {
          setTimeout(() => {
            setSelectedRowKeys([]);
            message.success(t("successfullyDeleted"));
            resolve(true);
          }, 500);
        }).catch(() => console.log("Oops errors!"));
      },
    });
  };

  const updateFieldList = (msg: string) => {
    console.log("创建分组成功", msg);
  };

  const showAttrModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add" : "Edit";
    fieldRef.current?.showModal({
      title,
      type,
      attrList: propertyList,
      formInfo: row,
      subTitle: "",
    });
  };

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  const handleSearch = (condition: unknown) => {
    setQueryList(condition);
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
            {modelGroup.map((item) => (
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
            <SearchFilter
              userList={userList}
              attrList={propertyList}
              organizationList={organizationList}
              onSearch={handleSearch}
            />
            <Space>
              <Button
                type="primary"
                className="mr-[8px]"
                icon={<PlusOutlined />}
                onClick={() => showAttrModal("add")}
              >
                {t("add")}
              </Button>
              <Button>Export</Button>
              <Button
                onClick={() => showAttrModal("add")}
                disabled={!selectedRowKeys.length}
              >
                {t("edit")}
              </Button>
              <Button onClick={handleDelete} disabled={!selectedRowKeys.length}>
                {t("delete")}
              </Button>
            </Space>
          </div>
          <CustomTable
            rowSelection={rowSelection}
            dataSource={tableData}
            columns={columns}
            pagination={pagination}
            loading={tableLoading}
            onChange={handleTableChange}
          />
          <FieldModal
            ref={fieldRef}
            userList={userList}
            organizationList={organizationList}
            onSuccess={(msg) => updateFieldList(msg)}
          />
        </div>
      </div>
    </Spin>
  );
};

export default AssetData;
