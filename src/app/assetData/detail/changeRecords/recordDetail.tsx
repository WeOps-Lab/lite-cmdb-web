"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Button, Spin } from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import useApiClient from "@/utils/request";
import { AttrFieldType } from "@/types/assetManage";
import { deepClone, getFieldItem } from "@/utils/common";
import CustomTable from "@/components/custom-table";

interface FieldModalProps {
  userList: Array<any>;
  propertyList: AttrFieldType[];
}

interface FieldConfig {
  subTitle: string;
  title: string;
  recordRow: any;
}

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const RecordDetail = forwardRef<FieldModalRef, FieldModalProps>(
  ({ userList, propertyList }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [attrList, setAttrList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [recordRow, setRecordRow] = useState<any>({});
    const { t } = useTranslation();
    const { get } = useApiClient();

    const formData: any = {
      list: [
        { label: "动作", id: "type" },
        { label: "模型类型", id: "model_id" },
        { label: "操作实例", id: "inst_id" },
        { label: "操作时间", id: "created_at" },
        { label: "操作账号", id: "operator" },
      ],
      attrList: [],
      attrColumns: [
        {
          title: "属性",
          key: "attr",
          align: "left",
          minWidth: "50",
        },
        {
          title: "变更前",
          key: "before",
          align: "left",
          minWidth: "100px",
        },
        {
          title: "变更后",
          key: "after",
          align: "left",
          minWidth: "100px",
        },
      ],
    };

    useImperativeHandle(ref, () => ({
      showModal: ({ subTitle, title, recordRow }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setTitle(title);
        setRecordRow(recordRow);
        getChangeRecordDetail(recordRow.id);
        if (recordRow.label === "instance_association") {
          formData.attrColumns[0] = {
            title: "对象类型",
            key: "attr",
            align: "left",
            minWidth: "50",
          };
        }
      },
    }));

    const getShowValue = (field: any, tex: any) => {
      // getFieldItem()
      return "--";
    };
    const showModelName = (id: string) => {
      return "--";
    };

    const showConnectType = (id: string) => {
      return "--";
    };

    const getDisplayName = (id: string) => {
      let label: any = id || "--";
      switch (id) {
        case "type":
          label = "--";
          break;
        case "model_id":
          label = "--";
          break;
        case "inst_id":
          label = "--";
          break;
      }
      return label;
    };
    const getChangeRecordDetail = async (id: number) => {
      try {
        setLoading(true);
        const data = await get(`/api/change_record/${id}/`);
        const {
          before_data: beforeData,
          after_data: afterData,
          label,
          type,
        } = data;
        if (label === "instance") {
          const list = type === "delete_entity" ? [] : afterData;
          formData.attrList = Object.keys(list)
            .map((item) => {
              const field = propertyList.find((prop) => prop.attr_id === item);
              if (field) {
                field.key = field.attr_id;
                const beforTex: any = {};
                beforTex[item] = beforeData[item];
                const afterTex: any = {};
                afterTex[item] = afterData[item];
                return {
                  attr: field.attr_name,
                  before: getShowValue(field, beforTex),
                  after: getShowValue(field, afterTex),
                };
              }
              return {
                attr: null,
              };
            })
            .filter((attr) => !!attr.attr);
        } else {
          let before = "--";
          let after = "--";
          formData.attrList = data;
          if (type === "delete_edge") {
            before = `${showModelName(beforeData.edge.src_model_id)}(${
              beforeData.src.inst_name
            })${showConnectType(beforeData.edge.asst_id)}${showModelName(
              beforeData.edge.dst_model_id
            )}(${beforeData.dst.inst_name})`;
          } else {
            after = `${showModelName(afterData.edge.src_model_id)}(${
              afterData.src.inst_name
            })${showConnectType(afterData.edge.asst_id)}${showModelName(
              afterData.edge.dst_model_id
            )}(${afterData.dst.inst_name})`;
          }
          formData.attrList = [
            {
              attr: "关联关系",
              before,
              after,
            },
          ];
        }
      } finally {
        setLoading(false);
      }
    };

    const handleCancel = () => {
      setGroupVisible(false);
    };

    return (
      <div>
        <OperateModal
          width={600}
          title={title}
          subTitle={subTitle}
          visible={groupVisible}
          onCancel={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t("cancel")}</Button>
            </div>
          }
        >
          <Spin spinning={loading}>
            <div>
              <ul className="description">
                {formData.list.map((item: any, index: number) => {
                  return (
                    <li key={index}>
                      <span className="label">{item.label}：</span>
                      <span className="name">{getDisplayName(item.id)}</span>
                    </li>
                  );
                })}
              </ul>
              <CustomTable
                scroll={{ y: "calc(100vh - 390px)" }}
                columns={formData.attrColumns}
                dataSource={[]}
                rowKey="id"
              ></CustomTable>
            </div>
          </Spin>
        </OperateModal>
      </div>
    );
  }
);
RecordDetail.displayName = "recordDetail";
export default RecordDetail;
