"use client";

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Select, Button, message, TablePaginationConfig } from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import {
  AttrFieldType,
  UserItem,
  Organization,
  ModelItem,
  ColumnItem,
} from "@/types/assetManage";
import { deepClone, getAssetColumns } from "@/utils/common";
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
  propertyList: AttrFieldType[];
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

interface RequestParams {
  credential_type?: string;
  data: object;
}

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const SelectInstance = forwardRef<FieldModalRef, FieldModalProps>(
  (
    { onSuccess, userList, organizationList, propertyList, instanceModels },
    ref
  ) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [formItems, setFormItems] = useState<AttrFieldType[]>([]);
    const [instanceData, setInstanceData] = useState<any>({});
    const [modelId, setModelId] = useState<string>("");
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([]);
    const [columns, setColumns] = useState<ColumnItem[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [queryList, setQueryList] = useState<unknown>(null);
    const { t } = useTranslation();
    const { post, patch, get } = useApiClient();

    useEffect(() => {
      if (modelId) {
        fetchData();
      }
    }, [pagination?.current, pagination?.pageSize, queryList]);

    useImperativeHandle(ref, () => ({
      showModal: async ({
        type,
        attrList,
        subTitle,
        title,
        formInfo,
        model_id,
      }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        setModelId(model_id);
        setFormItems(attrList);
        setInstanceData(formInfo);
        const columns = getAssetColumns({
          attrList: propertyList,
          userList,
          groupList: organizationList,
          t,
        });
        columns[0].fixed = true;
        setColumns(columns);
        fetchData();
      },
    }));

    const onSelectChange = (selectedKeys: any) => {
      setSelectedRowKeys(selectedKeys);
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const handleSubmit = () => {
      operateAttr({});
    };

    const operateAttr = async (params: any) => {
      try {
        setConfirmLoading(true);
        const formData = deepClone(params);
        const msg: string = t(
          type === "add" ? "successfullyAdded" : "successfullyModified"
        );
        const url: string =
          type === "add"
            ? `/api/credential/`
            : `/api/credential/${instanceData._id}/`;
        let requestParams: RequestParams = {
          credential_type: modelId,
          data: formData,
        };
        let requestType = post;
        if (type === "edit") {
          requestType = patch;
          requestParams = formData;
        }
        await requestType(url, requestParams);
        message.success(msg);
        onSuccess();
        handleCancel();
      } catch (error) {
        console.log(error);
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
        model_id: "mysql",
        role: "",
      };
    };

    const handleCancel = () => {
      setGroupVisible(false);
    };

    const handleSearch = (condition: unknown) => {
      setQueryList(condition);
    };

    const handleTableChange = (pagination = {}) => {
      setPagination(pagination);
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
          <div className={selectInstanceStyle.selectInstance}>
            <div className={selectInstanceStyle.instanceList}>
              <div className="flex items-center justify-between mb-[10px]">
                <Select className="w-[140px]">
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
                  attrList={propertyList}
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
                    1
                  </span>
                  条）
                </span>
                <span className="text-[var(--color-primary)] cursor-pointer">清空</span>
              </div>
              <ul className={selectInstanceStyle.list}>
                <li className={selectInstanceStyle.listItem}>
                  <span>setFieldsValue</span>
                  <CloseOutlined className={`text-[12px] ${selectInstanceStyle.operate}`} />
                </li>
                <li className={selectInstanceStyle.listItem}>
                  <span>setFieldsValue</span>
                  <CloseOutlined className={`text-[12px] ${selectInstanceStyle.operate}`} />
                </li>
              </ul>
            </div>
          </div>
        </OperateModal>
      </div>
    );
  }
);
SelectInstance.displayName = "fieldMoadal";
export default SelectInstance;
