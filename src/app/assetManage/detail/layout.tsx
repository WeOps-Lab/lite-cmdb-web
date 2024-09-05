"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card, Modal, message, Spin } from "antd";
import WithSideMenuLayout from "@/components/sub-layout";
import { useRouter } from "next/navigation";
import { getIconUrl } from "@/utils/common";
import Image from "next/image";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import ModelModal from "../list/modelModal";
import attrLayoutStyle from "./layout.module.less";
import useApiClient from "@/utils/request";
import { ClassificationItem } from "@/types/assetManage";

const menuItems = [
  { label: "Attributes", path: "/assetManage/detail/attributes" },
  { label: "Relationships", path: "/assetManage/detail/associations" },
];

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [groupList, setGroupList] = useState<ClassificationItem[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const objIcon: string = searchParams.get("icn") || "";
  const modelName: string = searchParams.get("model_name") || "";
  const modelId: string = searchParams.get("model_id") || "";
  const classificationId: string = searchParams.get("classification_id") || "";
  const { confirm } = Modal;
  const modelRef = useRef<any>(null);
  const { get, del, isLoading } = useApiClient();

  useEffect(() => {
    if (isLoading) return;
    getGroups();
  }, [isLoading, get]);

  const getGroups = async () => {
    setPageLoading(true);
    try {
      const { result, data } = await get("/api/classification/");
      if (result) {
        setGroupList(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };
  const onSuccess = (info: any) => {
    router.replace(
      `/assetManage/detail/attributes?icn=${info.icn}&model_name=${info.model_name}&model_id=${info.model_id}&classification_id=${info.classification_id}`
    );
  };

  const handleBackButtonClick = () => {
    // 处理返回按钮点击事件
    router.push(`/assetManage`);
  };

  const showDeleteConfirm = (row = { model_id: "" }) => {
    confirm({
      title: "Do you want to delete this item?",
      content: "After deletion, the data cannot be recovered.",
      centered: true,
      onOk() {
        return new Promise(async (resolve, reject) => {
          const res = await del(`/api/model/${row.model_id}/`);
          if (res.result) {
            message.success("Item deleted successfully");
            resolve(true);
          }
        });
      },
    });
  };

  const shoModelModal = (type: string, row = {}) => {
    const title = type === "add" ? "Add Model" : "Edit Model";
    modelRef.current?.showModal({
      title,
      type,
      modelForm: row,
      subTitle: "",
    });
  };

  return (
    <div className={`flex flex-col ${attrLayoutStyle.attrLayout}`}>
      <Spin spinning={pageLoading}>
        <Card style={{ width: "100%" }} className="mb-[20px]">
          <header className="flex items-center">
            <Image
              src={getIconUrl({ icn: objIcon, model_id: modelId })}
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
                    icn: objIcon,
                  })
                }
              />
              <DeleteTwoTone
                className="delete cursor-pointer"
                onClick={() =>
                  showDeleteConfirm({
                    model_id: modelId,
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
          onSuccess={onSuccess}
        />
      </Spin>
    </div>
  );
};

export default AboutLayout;
