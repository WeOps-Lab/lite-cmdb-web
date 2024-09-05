"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Modal, message } from "antd";
import { useSearchParams } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";
import CustomTable from "@/components/custom-table";
import AttributesModal from "./attributesModal";
import { Tag } from "antd";
import type { TableColumnsType } from "antd";
import { ATTR_TYPE_LIST } from "@/constants/asset";
import useApiClient from "@/utils/request";
const { confirm } = Modal;

const Attributes = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const attrRef = useRef<any>(null);
  const { get, del } = useApiClient();
  const { confirm } = Modal;
  const searchParams = useSearchParams();
  const modelId = searchParams.get("model_id");
  const showAttrModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add Attribute" : "Edit Attribute";
    attrRef.current?.showModal({
      title,
      type,
      attrInfo: row,
      subTitle: "",
    });
  };
  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "attr_name",
      key: "attr_name",
    },
    {
      title: "Type",
      dataIndex: "attr_type",
      key: "attr_type",
      render: (_, { attr_type }) => (
        <>
          {ATTR_TYPE_LIST.find((item) => item.id === attr_type)?.name || "--"}
        </>
      ),
    },
    {
      title: "REQUIRED",
      key: "is_required",
      dataIndex: "is_required",
      render: (_, { is_required }) => (
        <>
          {
            <Tag color={is_required ? "green" : "geekblue"}>
              {is_required ? "Yes" : "No"}
            </Tag>
          }
        </>
      ),
    },
    {
      title: "EDITABLE",
      key: "editable",
      dataIndex: "editable",
      render: (_, { editable }) => (
        <>
          {
            <Tag color={editable ? "green" : "geekblue"}>
              {editable ? "Yes" : "No"}
            </Tag>
          }
        </>
      ),
    },
    {
      title: "UNIQUE",
      key: "is_unique",
      dataIndex: "is_unique",
      render: (_, { is_only }) => (
        <>
          {
            <Tag color={is_only ? "green" : "geekblue"}>
              {is_only ? "Yes" : "No"}
            </Tag>
          }
        </>
      ),
    },
    {
      title: "ACTIONS",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => showAttrModal("edit", record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() =>
              showDeleteConfirm({
                model_id: record.model_id,
                attr_id: record.attr_id,
              })
            }
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const showDeleteConfirm = (row = { model_id: "", attr_id: "" }) => {
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        return new Promise(async (resolve, reject) => {
          const res = await del(
            `/api/model/${row.model_id}/attr/${row.attr_id}/`
          );
          if (res.result) {
            message.success("Item deleted successfully");
            if (pagination.current > 1 && tableData.length === 1) {
              pagination.current--;
            }
            fetchData();
            resolve(true);
          }
        });
      },
    });
  };

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
  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };
  const getTableParams = () => {
    return {
      search: searchText,
      current: pagination.current,
      limit: pagination.pageSize,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    // const params = getTableParams();
    try {
      const { result, data } = await get(`/api/model/${modelId}/attr_list/`);
      if (result) {
        setTableData(data);
        pagination.total = data.length;
        pagination.pageSize = 10;
        setPagination(pagination);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttrList = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [pagination]);

  return (
    <div>
      <div>
        <div className="nav-box flex justify-end mb-[10px]">
          <div className="left-side w-[240px] mr-[8px]">
            <Input
              placeholder="search..."
              value={searchText}
              allowClear
              onChange={onSearchTxtChange}
              onPressEnter={onTxtPressEnter}
              onClear={onTxtClear}
            />
          </div>
          <div className="right-side">
            <Button
              type="primary"
              className="mr-[8px]"
              icon={<PlusOutlined />}
              onClick={() => showAttrModal("add")}
            >
              Add
            </Button>
          </div>
        </div>
        <CustomTable
          scroll={{ y: "calc(100vh - 410px)" }}
          columns={columns}
          dataSource={tableData}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        ></CustomTable>
      </div>
      <AttributesModal
        ref={attrRef}
        attrTypeList={ATTR_TYPE_LIST}
        onSuccess={updateAttrList}
      />
    </div>
  );
};

export default Attributes;
