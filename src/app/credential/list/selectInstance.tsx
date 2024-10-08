"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Select, Button, message, TablePaginationConfig, Spin } from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import {
  AttrFieldType,
  UserItem,
  Organization,
  ModelItem,
  ColumnItem,
} from "@/types/assetManage";
import { getAssetColumns } from "@/utils/common";
import useApiClient from "@/utils/request";
import SearchFilter from "@/app/assetData/list/searchFilter";
import CustomTable from "@/components/custom-table";
import selectInstanceStyle from "./selectInstance.module.less";
const { Option } = Select;
import { CloseOutlined } from "@ant-design/icons";

interface FieldModalProps {
  onSuccess: () => void;
  userList: UserItem[];
  organizationList: Organization[];
  instanceModels: ModelItem[];
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

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const SelectInstance = forwardRef<FieldModalRef, FieldModalProps>(
  ({ onSuccess, userList, organizationList, instanceModels }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [instanceData, setInstanceData] = useState<any>({});
    const [modelId, setModelId] = useState<string>("");
    const [credentialModelId, setCredentialModelId] = useState<string>("");
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([]);
    const [columns, setColumns] = useState<ColumnItem[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [queryList, setQueryList] = useState<unknown>(null);
    const [intancePropertyList, setIntancePropertyList] = useState<
      AttrFieldType[]
    >([]);
    const { t } = useTranslation();
    const { post, get } = useApiClient();

    useEffect(() => {
      if (modelId) {
        fetchData();
      }
    }, [pagination?.current, pagination?.pageSize, queryList]);

    useImperativeHandle(ref, () => ({
      showModal: async ({ subTitle, title, formInfo, model_id }) => {
        // 开启弹窗的交互
        const defaultModelId = instanceModels[0].model_id;
        setGroupVisible(true);
        setSubTitle(subTitle);
        setTitle(title);
        setModelId(model_id);
        setInstanceData(formInfo);
        setCredentialModelId(defaultModelId);
        initPage(defaultModelId, formInfo);
      },
    }));

    const initPage = async (modelId: string, formInfo?: any) => {
      setLoading(true);
      try {
        const params = getTableParams();
        const credentialParams = {
          credential_id: formInfo._id || instanceData._id,
        };
        params.model_id = modelId;
        const attrList = get(`/api/model/${modelId}/attr_list/`);
        const getInstanseList = post(`/api/instance/search/`, params);
        const getAssoInsts = post(
          "/api/credential/credential_association_inst_list/",
          credentialParams
        );
        Promise.all([attrList, getInstanseList, getAssoInsts])
          .then((res) => {
            setIntancePropertyList(res[0]);
            const columns = getAssetColumns({
              attrList: res[0],
              userList,
              groupList: organizationList,
              t,
            });
            columns[0].fixed = true;
            setColumns(columns);
            setTableData(res[1].insts);
            pagination.total = res[1].count;
            setPagination(pagination);
            setLoading(false);
            setSelectedRowKeys(res[2].map((item: any) => item._id));
          })
          .catch(() => {
            setLoading(false);
          });
      } catch {
        setLoading(false);
      }
    };

    const onSelectChange = (selectedKeys: any) => {
      setSelectedRowKeys(selectedKeys);
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const handleSubmit = async () => {
      setConfirmLoading(true);
      try {
        const params = {
          credential_id: instanceData._id,
          instance_ids: selectedRowKeys,
          model_id: credentialModelId
        };
        await post(`/api/credential/credential_association_inst/`, params);
        message.success(t("successfullyAssociated"));
        handleCancel();
      } finally {
        setConfirmLoading(false);
      }
    };

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

    const getTableParams = () => {
      return {
        query_list: queryList ? [queryList] : [],
        page: pagination.current,
        page_size: pagination.pageSize,
        order: "",
        model_id: credentialModelId,
        role: "",
      };
    };

    const handleCancel = () => {
      setGroupVisible(false);
      setSelectedRowKeys([]); // 清空选中项
    };

    const handleSearch = (condition: unknown) => {
      setQueryList(condition);
    };

    const handleTableChange = (pagination = {}) => {
      setPagination(pagination);
    };

    const handleModelChange = (model: string) => {
      setCredentialModelId(model);
      initPage(model);
    };

    const handleClearSelection = () => {
      setSelectedRowKeys([]); // 清空选中项
    };

    const handleRemoveItem = (key: string) => {
      const newSelectedRowKeys = selectedRowKeys.filter((item) => item !== key);
      setSelectedRowKeys(newSelectedRowKeys);
    };

    return (
      <div>
        <OperateModal
          title={title}
          subTitle={subTitle}
          visible={groupVisible}
          width={900}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {t("confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("cancel")}</Button>
            </div>
          }
        >
          <Spin spinning={loading}>
            <div className={selectInstanceStyle.selectInstance}>
              <div className={selectInstanceStyle.instanceList}>
                <div className="flex items-center justify-between mb-[10px]">
                  <Select
                    className="w-[140px]"
                    value={credentialModelId}
                    onChange={handleModelChange}
                  >
                    {instanceModels.map((item) => {
                      return (
                        <Option value={item.model_id} key={item.model_id}>
                          {item.model_name}
                        </Option>
                      );
                    })}
                  </Select>
                  <SearchFilter
                    userList={userList}
                    attrList={intancePropertyList}
                    organizationList={organizationList}
                    onSearch={handleSearch}
                  />
                </div>
                <CustomTable
                  rowSelection={rowSelection}
                  dataSource={tableData}
                  columns={columns}
                  pagination={pagination}
                  loading={tableLoading}
                  rowKey="_id"
                  scroll={{ x: 620, y: "calc(100vh - 200px)" }}
                  onChange={handleTableChange}
                />
              </div>
              <div className={selectInstanceStyle.previewList}>
                <div className="flex items-center justify-between mb-[10px]">
                  <span>
                    已选择（共
                    <span className="text-[var(--color-primary)] px-[4px]">
                      {selectedRowKeys.length}
                    </span>
                    条）
                  </span>
                  <span
                    className="text-[var(--color-primary)] cursor-pointer"
                    onClick={handleClearSelection}
                  >
                    清空
                  </span>
                </div>
                <ul className={selectInstanceStyle.list}>
                  {selectedRowKeys.map((key) => {
                    const item = tableData.find((data) => data._id === key);
                    return (
                      <li className={selectInstanceStyle.listItem} key={key}>
                        <span>{item?.inst_name || "--"}</span>
                        <CloseOutlined
                          className={`text-[12px] ${selectInstanceStyle.operate}`}
                          onClick={() => handleRemoveItem(key)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Spin>
        </OperateModal>
      </div>
    );
  }
);
SelectInstance.displayName = "fieldMoadal";
export default SelectInstance;
