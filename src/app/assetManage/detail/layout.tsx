"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card, Modal, message } from "antd";
import WithSideMenuLayout from "@/components/sub-layout";
import { useRouter } from "next/navigation";
import { getIconUrl } from "@/utils/common";
import Image from "next/image";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import ModelModal from "../list/modelModal";
import attrLayoutStyle from './layout.module.less'

const menuItems = [
  { label: "Attributes", path: "/assetManage/detail/attributes" },
  { label: "Relationships", path: "/assetManage/detail/associations" },
];

interface GroupList {
  classification_name: string;
  classification_id: string;
}

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groupList, setGroupList] = useState<GroupList[]>([]);
  const objIcon: string = searchParams.get("bk_obj_icon") || "";
  const modelName: string = searchParams.get("bk_obj_name") || "";
  const modelId: string = searchParams.get("bk_obj_id") || "";
  const classificationId: string = searchParams.get("classification_id") || "";
  const { confirm } = Modal;
  const modelRef = useRef<any>(null);

  useEffect(() => {
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
    setGroupList(groupList);
  }, []);

  const handleBackButtonClick = () => {
    // 处理返回按钮点击事件
    router.push(`/assetManage`);
  };

  const showDeleteConfirm = (record = {}) => {
    console.log(record);
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        message.success("Delete successfully !");
      },
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

  const updateModelList = (msg: string) => {
    console.log("编辑模型成功", msg);
  };

  return (
    <div className={`flex flex-col ${attrLayoutStyle.attrLayout}`}>
      <Card style={{ width: "100%" }} className="mb-[20px]">
        <header className="flex items-center">
          <Image
            src={getIconUrl({ bk_obj_icon: objIcon, bk_obj_id: modelId })}
            className="block mr-[20px]"
            alt="图标"
            width={40}
            height={40}
          />
          <div className="flex flex-col mr-[10px]">
            <span className="text-[16px] font-[800] mb-[2px] ">
              {modelName}
            </span>
            <span className="text-[var(--color-text-3)]">{modelId}</span>
          </div>
          <div className="self-start">
            <EditTwoTone
              className="edit mr-[6px] cursor-pointer"
              onClick={() =>
                shoModelModal("edit", {
                  model_name: modelName,
                  model_id: modelId,
                  classification_id: classificationId,
                  objIcon,
                })
              }
            />
            <DeleteTwoTone
              className="delete cursor-pointer"
              onClick={() =>
                showDeleteConfirm({
                  modelName,
                  modelId,
                  objIcon,
                })
              }
            />
          </div>
        </header>
      </Card>
      <WithSideMenuLayout
        menuItems={menuItems}
        showBackButton={true}
        onBackButtonClick={handleBackButtonClick}
      >
        {children}
      </WithSideMenuLayout>
      <ModelModal
        ref={modelRef}
        groupList={groupList}
        onSuccess={(msg) => updateModelList(msg)}
      />
    </div>
  );
};

export default AboutLayout;
