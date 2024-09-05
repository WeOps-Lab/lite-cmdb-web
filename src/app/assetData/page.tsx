"use client";

import React, { useState, useRef } from "react";
import { Tree, Input, Button, Space, Modal, Radio, Tabs, message } from "antd";
import CustomTable from "@/components/custom-table";
import type { TableColumnsType } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { RadioChangeEvent, TabsProps } from "antd";
import assetDataStyle from "./index.module.less";
import { getRandomColor } from "@/utils/common";
import FieldModal from "./list/fieldModal";
const { confirm } = Modal;

const treeData = [
  {
    title: "Organization 1",
    key: "0-0",
    children: [
      {
        title: "Department 1",
        key: "0-0-0",
        children: [
          { title: "Team 1", key: "0-0-0-0" },
          { title: "Team 2", key: "0-0-0-1" },
        ],
      },
      {
        title: "Department 2",
        key: "0-0-1",
        children: [{ title: "Team 3", key: "0-0-1-0" }],
      },
    ],
  },
];

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
    label: "Tab 1",
  },
  {
    key: "2",
    label: "Tab 2",
  },
  {
    key: "3",
    label: "Tab 3",
  },
];

const AssetData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const fieldRef = useRef<any>(null);

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
      title: "Are you sure delete these items?",
      onOk: () => {
        message.success("Item deleted successfully");
        setSelectedRowKeys([]);
      },
    });
  };

  const onGroupChange = (e: RadioChangeEvent) => {
    console.log(`radio checked:${e.target.value}`);
  };

  const showDeleteConfirm = (row = {}) => {
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            setSelectedRowKeys([]);
            message.success("Item deleted successfully");
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
      title: "Action",
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
          <Button type="link" onClick={() => showDeleteConfirm(record)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className={assetDataStyle.assetData}>
      <div className={`mb-[20px] ${assetDataStyle.groupSelector}`}>
        <Radio.Group
          onChange={onGroupChange}
          defaultValue="a"
          buttonStyle="solid"
        >
          <Radio.Button value="a">Hangzhou</Radio.Button>
          <Radio.Button value="b">Shanghai</Radio.Button>
          <Radio.Button value="c">Beijing</Radio.Button>
          <Radio.Button value="d">Chengdu</Radio.Button>
        </Radio.Group>
      </div>
      <div className="ml-[10px] p-[20px] pt-0px bg-[var(--color-bg-1)]">
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
              Add
            </Button>
            <Button>Export</Button>
            <Button
              onClick={() => showAttrModal("add")}
              disabled={!selectedRowKeys.length}
            >
              Edit
            </Button>
            <Button onClick={handleDelete} disabled={!selectedRowKeys.length}>
              Delete
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
