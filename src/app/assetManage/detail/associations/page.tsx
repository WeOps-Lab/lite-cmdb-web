"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Modal, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CustomTable from "@/components/custom-table";
import AssociationsModal from "./associationsModal";
import { Tag } from "antd";
import type { TableColumnsType } from "antd";
import { CONSTRAINT_List } from "@/constants/asset";
import useApiClient from "@/utils/request";
import { ModelItem, AssoTypeItem } from "@/types/assetManage";
import { useSearchParams } from "next/navigation";
const { confirm } = Modal;

const Associations = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [pagination, setPagination] = useState<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [assoTypeList, setAssoTypeList] = useState<AssoTypeItem[]>([]);
  const assoRef = useRef<any>(null);
  const { get, del } = useApiClient();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("model_id");

  const showAssoModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add Associations" : "Edit Associations";
    assoRef.current?.showModal({
      title,
      type,
      assoInfo: row,
      subTitle: "",
    });
  };
  const showModelName = (id: string) => {
    return modelList.find((item) => item.model_id === id)?.model_name || "--";
  };
  const columns: TableColumnsType<any> = [
    {
      title: "Source Model",
      dataIndex: "src_model_id",
      key: "src_model_id",
      render: (_, { src_model_id }) => <>{showModelName(src_model_id)}</>,
    },
    {
      title: "Target Model",
      dataIndex: "dst_model_id",
      key: "dst_model_id",
      render: (_, { dst_model_id }) => <>{showModelName(dst_model_id)}</>,
    },
    {
      title: "Constraint",
      dataIndex: "mapping",
      key: "mapping",
      render: (_, { mapping }) => (
        <>{CONSTRAINT_List.find((item) => item.id === mapping)?.name || "--"}</>
      ),
    },
    {
      title: "Type",
      key: "asst_id",
      dataIndex: "asst_id",
      render: (_, { asst_id }) => {
        const assoType =
          assoTypeList.find((item) => item.asst_id === asst_id)?.asst_name ||
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
            className="mr-[10px]"
            type="link"
            onClick={() => showAssoModal("edit", record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            onClick={() => showDeleteConfirm(record.model_asst_id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const showDeleteConfirm = (id: string) => {
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        return new Promise(async (resolve, reject) => {
          const res = await del(`/api/model/association/${id}/`);
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

  const fetchData = async (type?: string) => {
    setLoading(true);
    const params = getTableParams();
    console.log(params);
    try {
      const res = await get(`/api/model/${modelId}/association/`);
      if (res.result) {
        setTableData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateAssoList = () => {
    fetchData();
  };

  const getInitData = () => {
    const getAssoTypeList = get("/api/model/model_association_type/");
    const getModelList = get("/api/model/");
    const fetchAssoData = get(`/api/model/${modelId}/association/`);
    setLoading(true);
    Promise.all([getModelList, getAssoTypeList, fetchAssoData])
      .then((res) => {
        if (res[0].result && res[1].result && res[2]) {
          const modeldata: ModelItem[] = res[0].data;
          const assoTypeData: AssoTypeItem[] = res[1].data;
          const assoTableData: AssoTypeItem[] = res[2].data;
          setAssoTypeList(assoTypeData);
          setModelList(modeldata);
          setTableData(assoTableData);
          //   pagination.total = res[2].count || 0
          setPagination(pagination);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getInitData();
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
        onSuccess={updateAssoList}
      />
    </div>
  );
};

export default Associations;
