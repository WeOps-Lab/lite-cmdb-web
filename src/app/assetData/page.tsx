"use client";

import React, { useState, useRef } from "react";
import { Input, Button, Space, Modal, Radio, Tabs, message } from "antd";
import CustomTable from "@/components/custom-table";
import type { TableColumnsType } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { RadioChangeEvent, TabsProps } from "antd";
import assetDataStyle from "./index.module.less";
import { getRandomColor } from "@/utils/common";
import FieldModal from "./list/fieldModal";
import { useTranslation } from "@/utils/i18n";
const { confirm } = Modal;

const dataSource = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    owner: "张三",
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    owner: "李四",
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sidney No. 1 Lake Park",
    owner: "xiao ming",
  },
];

const items: TabsProps["items"] = [
  {
    key: "1",
    label: "主机1",
  },
  {
    key: "2",
    label: "主机2",
  },
  {
    key: "3",
    label: "主机3",
  },
];

const AssetData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const fieldRef = useRef<any>(null);
  const { t } = useTranslation();

  const columns: TableColumnsType = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      render: (_, { owner }) => (
        <div className={assetDataStyle.owner}>
          <span
            className={assetDataStyle.userAvatar}
            style={{ background: getRandomColor() }}
          >
            {owner.slice(0, 1).toLocaleUpperCase()}
          </span>
          {owner}
        </div>
      ),
    },
    {
      title: t("action"),
      key: "action",
      render: (_, record) => (
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
  ];

  const onSelectChange = (selectedKeys: any) => {
    setSelectedRowKeys(selectedKeys);
  };

  const onChangeModel = (key: string) => {
    console.log(key);
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
    console.log(`radio checked:${e.target.value}`);
  };

  const showDeleteConfirm = (row = {}) => {
    confirm({
      title: t("deleteTitle"),
      content: t("deleteContent"),
      centered: true,
      onOk() {
        return new Promise((resolve, reject) => {
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
      groupInfo: row,
      subTitle: "",
    });
  };

  return (
    <div className={assetDataStyle.assetData}>
      <div className={`mb-[20px] ${assetDataStyle.groupSelector}`}>
        <Radio.Group
          onChange={onGroupChange}
          defaultValue="a"
          buttonStyle="solid"
        >
          <Radio.Button value="a">主机管理</Radio.Button>
          <Radio.Button value="b">数据库</Radio.Button>
          <Radio.Button value="c">网络设备</Radio.Button>
          <Radio.Button value="d">中间件</Radio.Button>
        </Radio.Group>
      </div>
      <div className={assetDataStyle.assetList}>
        <Tabs defaultActiveKey="1" items={items} onChange={onChangeModel} />
        <div className="flex justify-between mb-4">
          <Input placeholder="Search Table" style={{ width: 200 }} />
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
          dataSource={dataSource}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
        <FieldModal ref={fieldRef} onSuccess={(msg) => updateFieldList(msg)} />
      </div>
    </div>
  );
};

export default AssetData;
