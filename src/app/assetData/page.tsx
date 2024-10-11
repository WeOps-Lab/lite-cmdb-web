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
  Dropdown,
  TablePaginationConfig,
} from "antd";
import CustomTable from "@/components/custom-table";
import SearchFilter from "./list/searchFilter";
import ImportInst from "./list/importInst";
import { PlusOutlined } from "@ant-design/icons";
import type { RadioChangeEvent } from "antd";
import assetDataStyle from "./index.module.less";
import FieldModal from "./list/fieldModal";
import { useTranslation } from "@/utils/i18n";
import useApiClient from "@/utils/request";
const { confirm } = Modal;
import {
  deepClone,
  getAssetColumns,
  convertArray,
  filterNodesWithAllParents,
} from "@/utils/common";
import {
  GroupItem,
  ModelItem,
  ColumnItem,
  UserItem,
  Organization,
  AttrFieldType,
} from "@/types/assetManage";
import axios from "axios";
import { useAuth } from "@/context/auth";
import { useCommon } from "@/context/common";

import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";

interface ModelTabs {
  key: string;
  label: string;
  icn: string;
}
interface FieldRef {
  showModal: (config: FieldConfig) => void;
}
interface ImportRef {
  showModal: (config: {
    subTitle: string;
    title: string;
    model_id: string;
  }) => void;
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

const AssetData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([]);
  const fieldRef = useRef<FieldRef>(null);
  const importRef = useRef<ImportRef>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [modelGroup, setModelGroup] = useState<GroupItem[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");
  const [modelList, setModelList] = useState<ModelTabs[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);
  const [displayFieldKeys, setDisplayFieldKeys] = useState<string[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState<ColumnItem[]>([]);
  const [queryList, setQueryList] = useState<unknown>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const { t } = useTranslation();
  const { get, del, post, isLoading } = useApiClient();
  const authContext = useAuth();
  const token = authContext?.token || null;
  const tokenRef = useRef(token);
  const router = useRouter();
  const commonContext = useCommon();
  const permissionGroupsInfo = commonContext?.permissionGroupsInfo || null;
  const groupsInfoRef = useRef(permissionGroupsInfo);

  const handleExport = async (keys: string[]) => {
    try {
      setExportLoading(true);
      const response = await axios({
        url: `/reqApi/api/instance/${modelId}/inst_export/`, // 替换为你的导出数据的API端点
        method: "POST",
        responseType: "blob", // 确保响应类型为blob
        data: keys,
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      // 创建一个Blob对象
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      // 创建一个下载链接
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${modelId}资产列表.xlsx`; // 设置下载文件的名称
      document.body.appendChild(link);
      link.click();
      // 移除下载链接
      document.body.removeChild(link);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const showImportModal = () => {
    importRef.current?.showModal({
      title: t("import"),
      subTitle: "",
      model_id: modelId,
    });
  };

  const addInstItems: MenuProps["items"] = [
    {
      key: "1",
      label: <a onClick={() => showAttrModal("add")}>{t("add")}</a>,
    },
    {
      key: "2",
      label: <a onClick={showImportModal}>{t("import")}</a>,
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    getModelGroup();
  }, [get, isLoading]);

  useEffect(() => {
    if (modelId) {
      fetchData();
    }
  }, [pagination?.current, pagination?.pageSize, queryList]);

  useEffect(() => {
    if (propertyList.length && userList.length) {
      const attrList = getAssetColumns({
        attrList: propertyList,
        userList,
        groupList: organizationList,
        t,
      });
      const tableColumns = [
        ...attrList,
        {
          title: t("action"),
          key: "action",
          dataIndex: "action",
          width: 160,
          fixed: "right",
          render: (_: unknown, record: any) => (
            <>
              <Button
                type="link"
                className="mr-[10px]"
                onClick={() => checkDetail(record)}
              >
                {t("detail")}
              </Button>
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
      ];
      setColumns(tableColumns);
      setCurrentColumns(
        tableColumns.filter(
          (item) => displayFieldKeys.includes(item.key) || item.key === "action"
        )
      );
    }
  }, [propertyList, userList, displayFieldKeys]);

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
    const getOrganizationList = get("/api/user_group/group_list/");
    setLoading(true);
    try {
      Promise.all([
        getModelList,
        getCroupList,
        getUserList,
        getOrganizationList,
      ])
        .then((res) => {
          const modeldata: ModelItem[] = res[0];
          const groupData: GroupItem[] = res[1];
          const userData: UserItem[] = res[2].users;
          const groupIds = groupsInfoRef.current?.group_ids || [];
          const isAdmin = groupsInfoRef.current?.is_all || false;
          const permissionOrganizations = filterNodesWithAllParents(
            res[3],
            groupIds
          );
          const organizationData: Organization[] = convertArray(
            isAdmin ? res[3] : permissionOrganizations
          );
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
              icn: item.icn,
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
    const getDisplayFields = get(`/api/instance/${id}/show_field/detail/`);
    setLoading(true);
    try {
      Promise.all([getAttrList, getInstList, getDisplayFields])
        .then((res) => {
          pagination.total = res[1].count;
          const tableList = res[1].insts;
          const fieldKeys =
            res[2]?.show_fields ||
            res[0].map((item: AttrFieldType) => item.attr_id);
          setDisplayFieldKeys(fieldKeys);
          setPropertyList(res[0]);
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

  const onSelectFields = async (fields: string[]) => {
    setLoading(true);
    try {
      await post(`/api/instance/${modelId}/show_field/settings/`, fields);
      message.success(t("successfulSetted"));
      getInitData(modelId);
    } finally {
      setLoading(false);
    }
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
      icn: item.icn,
    }));
    const currentModelId = currentModelList[0].key;
    setModelList(currentModelList);
    setModelId(currentModelId);
    getInitData(currentModelId);
  };

  const showDeleteConfirm = (row = { _id: "" }) => {
    confirm({
      title: t("deleteTitle"),
      content: t("deleteContent"),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/api/instance/${row._id}/`);
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

  const batchDeleteConfirm = () => {
    confirm({
      title: t("deleteTitle"),
      content: t("deleteContent"),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            const list = selectedRowKeys;
            await post("/api/instance/batch_delete/", list);
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

  const batchOperateItems: MenuProps["items"] = [
    {
      key: "batchEdit",
      label: (
        <a
          onClick={() => {
            showAttrModal("batchEdit");
          }}
        >
          {t("batchEdit")}
        </a>
      ),
      disabled: !selectedRowKeys.length,
    },
    {
      key: "batchDelete",
      label: <a onClick={batchDeleteConfirm}>{t("batchDelete")}</a>,
      disabled: !selectedRowKeys.length,
    },
  ];

  const exportItems: MenuProps["items"] = [
    {
      key: "batchExport",
      label: (
        <a onClick={() => handleExport(selectedRowKeys)}>{t("selected")}</a>
      ),
      disabled: !selectedRowKeys.length,
    },
    {
      key: "exportCurrentPage",
      label: (
        <a onClick={() => handleExport(tableData.map((item) => item._id))}>
          {t("currentPage")}
        </a>
      ),
    },
    {
      key: "exportAll",
      label: <a onClick={() => handleExport([])}>{t("all")}</a>,
    },
  ];

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

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  const handleSearch = (condition: unknown) => {
    setQueryList(condition);
  };

  const checkDetail = (row = { _id: "" }) => {
    const modelItem = modelList.find((item) => item.key === modelId);
    router.push(
      `/assetData/detail/baseInfo?icn=${modelItem?.icn || ""}&model_name=${
        modelItem?.label || ""
      }&model_id=${modelId}&classification_id=${groupId}&inst_id=${row._id}`
    );
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
              <Dropdown menu={{ items: addInstItems }} placement="bottom" arrow>
                <Button icon={<PlusOutlined />} type="primary">
                  {t("add")}
                </Button>
              </Dropdown>
              <Dropdown
                menu={{ items: exportItems }}
                disabled={exportLoading}
                placement="bottom"
                arrow
              >
                <Button>{t("export")}</Button>
              </Dropdown>
              <Dropdown
                menu={{ items: batchOperateItems }}
                disabled={!selectedRowKeys.length}
                placement="bottom"
                arrow
              >
                <Button>{t("more")}</Button>
              </Dropdown>
            </Space>
          </div>
          <CustomTable
            rowSelection={rowSelection}
            dataSource={tableData}
            columns={currentColumns}
            pagination={pagination}
            loading={tableLoading}
            scroll={{ x: "calc(100vw - 100px)", y: "calc(100vh - 200px)" }}
            fieldSetting={{
              showSetting: true,
              displayFieldKeys,
              choosableFields: columns.filter((item) => item.key !== "action"),
            }}
            onSelectFields={onSelectFields}
            rowKey="_id"
            onChange={handleTableChange}
          />
          <FieldModal
            ref={fieldRef}
            userList={userList}
            organizationList={organizationList}
            onSuccess={updateFieldList}
          />
          <ImportInst ref={importRef} onSuccess={updateFieldList} />
        </div>
      </div>
    </Spin>
  );
};

export default AssetData;
