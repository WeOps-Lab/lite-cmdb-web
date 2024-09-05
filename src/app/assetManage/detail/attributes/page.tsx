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
  const searchParams = useSearchParams();
  const param1 = searchParams.get("param1");
  const param2 = searchParams.get("param2");
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
      dataIndex: "name",
      key: "name",
    },
    // {
    //   title: "Id",
    //   dataIndex: "id",
    //   key: "id",
    // },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
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
      key: "is_editable",
      dataIndex: "is_editable",
      render: (_, { is_editable }) => (
        <>
          {
            <Tag color={is_editable ? "green" : "geekblue"}>
              {is_editable ? "Yes" : "No"}
            </Tag>
          }
        </>
      ),
    },
    {
      title: "UNIQUE",
      key: "is_unique",
      dataIndex: "is_unique",
      render: (_, { is_unique }) => (
        <>
          {
            <Tag color={is_unique ? "green" : "geekblue"}>
              {is_unique ? "Yes" : "No"}
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
          <Button type="link" className="mr-[10px]" onClick={()=> showAttrModal('edit',record)}>
            Edit
          </Button>
          <Button type="link" onClick={() => showDeleteConfirm(record)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  const showDeleteConfirm = (record = {}) => {
    console.log(record);
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        if (pagination.current > 1 && tableData.length === 1) {
          pagination.current--;
        }
        message.success("Delete successfully !");
        fetchData();
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

  const fetchData = () => {
    setLoading(true);
    const params = getTableParams();
    console.log(params);
    setTimeout(() => {
      const data: any[] = [
        {
          key: "1",
          name: "John Brown",
          id: 32,
          type: "int",
          is_required: true,
          is_editable: true,
          is_unique: false,
        },
        {
          key: "2",
          name: "Jim Green",
          id: 42,
          type: "int",
          is_required: true,
          is_editable: false,
          is_unique: false,
        },
        {
          key: "4",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "5",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "6",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "7",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "8",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "9",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "10",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "11",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "12",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "13",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "14",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
        {
          key: "15",
          name: "Joe Black",
          id: 36,
          type: "int",
          is_required: false,
          is_editable: true,
          is_unique: true,
        },
      ];
      setTableData(data);
      pagination.total = data.length;
      pagination.pageSize = 10;
      setPagination(pagination);
      setLoading(false);
    }, 500);
  };

  const updateAttrList = (msg: string) => {
    console.log("创建属性成功", msg);
  };

  useEffect(() => {
    console.log(param1, param2);
    fetchData();
    return () => {
      console.log("Component unmounted");
    };
  }, [pagination?.current, pagination?.pageSize]);

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
        onSuccess={(msg) => updateAttrList(msg)}
      />
    </div>
  );
};

export default Attributes;
