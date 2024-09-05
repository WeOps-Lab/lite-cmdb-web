"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Modal, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CustomTable from "@/components/custom-table";
import AssociationsModal from "./associationsModal";
import { Tag } from "antd";
import type { TableColumnsType } from "antd";
import { CONSTRAINT_List } from "@/constants/asset";
const { confirm } = Modal;

interface ModelListType {
  model_id: string;
  model_name: string;
}

interface AssoTypeList {
  model_id: string;
  model_name: string;
  obj_asst_id: string;
  asst_id: string;
  asst_name: string;
  [key: string]: any;
}

const Associations = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [modelList, setModelList] = useState<ModelListType[]>([]);
  const [assoTypeList, setAssoTypeList] = useState<AssoTypeList[]>([]);
  const assoRef = useRef<any>(null);
  const showAssoModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add Associations" : "Edit Associations";
    assoRef.current?.showModal({
      title,
      type,
      assoInfo: row,
      subTitle: "",
    });
  };
  const columns: TableColumnsType<any> = [
    // {
    //   title: "Name",
    //   dataIndex: "name",
    //   key: "name",
    // },
    {
      title: "Source Model",
      dataIndex: "source_model_id",
      key: "source_model_id",
    },
    {
      title: "Target Model",
      dataIndex: "target_model_id",
      key: "target_model_id",
    },
    {
      title: "Constraint",
      dataIndex: "constraint",
      key: "constraint",
      render: (_, { constraint }) => (
        <>
          {CONSTRAINT_List.find((item) => item.id === constraint)?.name || "--"}
        </>
      ),
    },
    {
      title: "Type",
      key: "type",
      dataIndex: "type",
      render: (_, { type }) => {
        const assoType =
          assoTypeList.find((item) => item.obj_asst_id === type)?.asst_name ||
          "--";
        return (
          <>
            {
              <Tag color={assoType ? "green" : "geekblue"}>
                {assoType || "--"}
              </Tag>
            }
          </>
        );
      },
    },
    {
      title: "ACTIONS",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => showAssoModal("edit", record)}
          >
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

  const getModelList = () => {
    const allModelList = [
      {
        model_id: "host",
        model_name: "主机",
      },
      {
        model_id: "mysql",
        model_name: "Mysql",
      },
    ];
    setModelList(allModelList);
  };
  const getAssoTypeList = () => {
    const allAssoTypeList = [
      {
        model_id: "mysql",
        model_name: "Mysql",
        obj_asst_id: "mysql_install_on_host",
        asst_name: "安装于",
        asst_id: "install_on",
      },
    ];
    setAssoTypeList(allAssoTypeList);
  };
  const fetchData = (type?: string) => {
    setLoading(true);
    const params = getTableParams();
    console.log(params);
    setTimeout(() => {
      const data: any[] = [
        {
          key: "1",
          name: "John Brown",
          id: 32,
          source_model_id: "host",
          target_model_id: "mysql",
          constraint: "1:n",
          type: "mysql_install_on_host",
        },
        {
          key: "2",
          name: "Jim Green",
          id: 42,
          source_model_id: "host",
          target_model_id: "mysql",
          constraint: "1:n",
          type: "mysql_install_on_host",
        },
        {
          key: "4",
          name: "Joe Black",
          id: 36,
          source_model_id: "host",
          target_model_id: "mysql",
          constraint: "1:n",
          type: "mysql_install_on_host",
        },
      ];
      setTableData(data);
      pagination.total = data.length;
      pagination.pageSize = 10;
      setPagination(pagination);
      setLoading(false);
    }, 500);
  };

  const updateAssoList = (msg: string) => {
    console.log("创建属性成功", msg);
  };

  useEffect(() => {
    // setLoading(true)
    Promise.all([getModelList(), fetchData("init"), getAssoTypeList()]).finally(
      () => {
        // setLoading(false)
      }
    );
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
              onClick={() => showAssoModal("add")}
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
      <AssociationsModal
        ref={assoRef}
        constraintList={CONSTRAINT_List}
        allModelList={modelList}
        assoTypeList={assoTypeList}
        onSuccess={(msg) => updateAssoList(msg)}
      />
    </div>
  );
};

export default Associations;
