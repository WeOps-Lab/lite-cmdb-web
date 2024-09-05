"use client";

import React, { useState, useEffect, useRef } from "react";
import Introduction from "@/components/introduction";
import { Input, Button, Modal, message } from "antd";
import {
  EditTwoTone,
  DeleteTwoTone,
  SwitcherOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import assetManageStyle from "./index.module.less";
import { getIconUrl } from "@/utils/common";
import GroupModal from "./list/groupModal";
import ModelModal from "./list/modelModal";
import { useRouter } from "next/navigation";
import useApiClient from "@/utils/request";

interface ListItem {
  bk_obj_icon: string;
  bk_obj_id: string;
  bk_obj_name: string;
  count: number;
}

interface Classification {
  classification_name: string;
  classification_id: string;
  count: number;
  list: ListItem[];
}

interface GroupList {
  classification_name: string;
  classification_id: string;
}

const AssetManage = () => {
  const [modelGroup, setModelGroup] = useState<Classification[]>([]);
  const [groupList, setGroupList] = useState<GroupList[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [dragItem, setDragItem] = useState<any>({});
  const [dragOverItem, setDragOverItem] = useState<any>({});
  const groupRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const router = useRouter();
  const { get, isLoading } = useApiClient();
  const { confirm } = Modal;
  const showDeleteConfirm = () => {
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            message.success("Item deleted successfully");
            resolve(true);
          }, 500);
        }).catch(() => console.log("Oops errors!"));
      },
      onCancel() {
        message.info("Action cancelled");
      },
    });
  };

  const showGroupModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add Group" : "Edit Group";
    groupRef.current?.showModal({
      title,
      type,
      groupInfo: row,
      subTitle: "",
    });
  };

  const shoModelModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add Model" : "Edit Model";
    modelRef.current?.showModal({
      title,
      type,
      groupInfo: row,
      subTitle: "",
    });
  };

  const updateGroupList = (msg: string) => {
    console.log("创建分组成功", msg);
  };

  const updateModelList = (msg: string) => {
    console.log("创建模型成功", msg);
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    console.log("enter", 123);
  };

  const onTxtClear = () => {
    console.log("clear", 456);
  };

  const linkToDetial = (
    model = {
      bk_obj_id: "",
      bk_obj_name: "",
      bk_obj_icon: "",
      classification_id: "",
    }
  ) => {
    router.push(
      `/assetManage/detail?bk_obj_icon=${model.bk_obj_icon}&bk_obj_name=${model.bk_obj_name}&bk_obj_id=${model.bk_obj_id}&classification_id=${model.classification_id}`
    );
  };

  const handleDragStart = (item: any) => {
    setDragItem(item);
  };

  const handleDragEnter = (item: any) => {
    setDragOverItem(item);
  };

  const handleDragEnd = (groupIndex: number) => {
    if (dragItem === null || dragOverItem === null) {
      return;
    }
    const newModelGroup = Array.from(modelGroup);
    const newItems = newModelGroup[groupIndex].list;
    const [draggedItem] = newItems.splice(dragItem.index, 1);
    newItems.splice(dragOverItem.index, 0, draggedItem);
    setDragItem(null);
    setDragOverItem(null);
    setModelGroup(newModelGroup);
  };

  useEffect(() => {
    const modelList = [
      {
        classification_name: "主机管理",
        classification_id: "host",
        count: 6,
        list: [
          {
            bk_obj_icon: "icon-cc-host",
            bk_obj_id: "host",
            bk_obj_name: "主机",
            count: 10,
          },
          {
            bk_obj_icon: "icon-cc-host",
            bk_obj_id: "host1",
            bk_obj_name: "主机1",
            count: 10,
          },
          {
            bk_obj_icon: "icon-cc-host",
            bk_obj_id: "host2",
            bk_obj_name: "主机2",
            count: 10,
          },
          {
            bk_obj_icon: "icon-cc-host",
            bk_obj_id: "host3",
            bk_obj_name: "主机3",
            count: 10,
          },
          {
            bk_obj_icon: "icon-cc-host",
            bk_obj_id: "host4",
            bk_obj_name: "主机4",
            count: 10,
          },
          {
            bk_obj_icon: "icon-cc-host",
            bk_obj_id: "host5",
            bk_obj_name: "主机5",
            count: 10,
          },
        ],
      },
      {
        classification_name: "数据库",
        classification_id: "data_base",
        count: 2,
        list: [
          {
            bk_obj_icon: "icon-cc-default",
            bk_obj_id: "db2",
            bk_obj_name: "DB2",
            count: 10,
          },
          {
            bk_obj_icon: "icon-cc-default",
            bk_obj_id: "db_cluster",
            bk_obj_name: "数据库集群",
            count: 10,
          },
        ],
      },
    ];
    const groupList = [
      {
        classification_name: "主机管理",
        classification_id: "host",
      },
      {
        classification_name: "数据库",
        classification_id: "data_base",
      },
    ];
    setModelGroup(modelList);
    setGroupList(groupList);
    if (isLoading) return;
    const fetchData = async () => {
      try {
        const response = await get("/api/classification/");
        console.log("Fetched data:", response);
        //   setData(response);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
    return () => {
      console.log("Component unmounted");
    };
  }, [get, isLoading]);

  return (
    <div style={{ width: "100%" }}>
      <Introduction
        title="Model Setting"
        message="Asset model management provides the creation and management of all asset models and model groups. You can create and manage them according to your needs."
      />
      <div className={assetManageStyle.modelSetting}>
        <div className="nav-box flex justify-between mb-[10px]">
          <div className="left-side w-[240px]">
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
              onClick={() => shoModelModal("add")}
            >
              Add Model
            </Button>
            <Button onClick={() => showGroupModal("add")}>Add Group</Button>
          </div>
        </div>
        {modelGroup.map((item, groupIndex) => {
          return (
            <div className="model-group" key={item.classification_id}>
              <div
                className={`${assetManageStyle.groupTitle} flex items-center mt-[20px] text-[14px]`}
              >
                <span className="border-l-[4px] border-[var(--color-primary)] px-[4px] py-[1px] font-[600]">
                  {item.classification_name}（{item.count}）
                </span>
                <div className={assetManageStyle.groupOperate}>
                  <EditTwoTone
                    className="edit mr-[6px] cursor-pointer"
                    onClick={() => showGroupModal("edit", item)}
                  />
                  <DeleteTwoTone
                    className="delete cursor-pointer"
                    onClick={showDeleteConfirm}
                  />
                </div>
              </div>
              <ul className={assetManageStyle.modelList}>
                {item.list.map((model, index) => (
                  <li
                    className={`bg-[var(--color-bg)] flex justify-between items-center ${
                      assetManageStyle.modelListItem
                    } ${
                      dragOverItem?.bk_obj_id === model.bk_obj_id &&
                      dragOverItem?.bk_obj_id !== dragItem?.bk_obj_id &&
                      modelGroup[groupIndex].list.find(
                        (group) => group.bk_obj_id === dragItem.bk_obj_id
                      )
                        ? assetManageStyle.dragActive
                        : ""
                    }`}
                    key={index}
                    draggable
                    onDragStart={() =>
                      handleDragStart({
                        ...model,
                        index,
                      })
                    }
                    onDragEnter={() =>
                      handleDragEnter({
                        ...model,
                        index,
                      })
                    }
                    onDragEnd={() => handleDragEnd(groupIndex)}
                  >
                    <div className={`${assetManageStyle.leftSide} pl-[4px]`}>
                      <HolderOutlined
                        className={`${assetManageStyle.dragHander} cursor-move`}
                      />
                      <Image
                        src={getIconUrl(model)}
                        className="block w-auto h-10"
                        alt="图标"
                        width={100}
                        height={40}
                      />
                      <div className="flex flex-col pl-[10px]">
                        <span className="text-[14px] pb-[4px] font-[600]">
                          {model.bk_obj_name}
                        </span>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {model.bk_obj_id}
                        </span>
                      </div>
                    </div>
                    <div
                      className={assetManageStyle.rightSide}
                      onClick={() =>
                        linkToDetial({
                          ...model,
                          classification_id: item.classification_id,
                        })
                      }
                    >
                      <SwitcherOutlined />
                      <span className="text-[12px] pt-[4px]">
                        {model.count}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <GroupModal ref={groupRef} onSuccess={(msg) => updateGroupList(msg)} />
      <ModelModal
        ref={modelRef}
        groupList={groupList}
        onSuccess={(msg) => updateModelList(msg)}
      />
    </div>
  );
};

export default AssetManage;
