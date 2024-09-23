"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Input,
  Button,
  Form,
  message,
  Select,
  Cascader,
  DatePicker,
  Col,
  Row,
} from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import { AttrFieldType, Organization, UserItem } from "@/types/assetManage";
import { deepClone } from "@/utils/common";
import useApiClient from "@/utils/request";

interface FieldModalProps {
  onSuccess: () => void;
  organizationList: Organization[];
  userList: UserItem[];
}

interface FieldConfig {
  type: string;
  attrList: AttrFieldType[];
  formInfo: any;
  subTitle: string;
  title: string;
  model_id: string;
  list: Array<any>;
}

interface RequestParams {
  model_id?: string;
  instance_info?: object;
  inst_ids?: number[];
  update_data?: object;
}

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const FieldMoadal = forwardRef<FieldModalRef, FieldModalProps>(
  ({ onSuccess, userList, organizationList }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [formItems, setFormItems] = useState<AttrFieldType[]>([]);
    const [instanceData, setInstanceData] = useState<any>({});
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [modelId, setModelId] = useState<string>("");
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { post } = useApiClient();
    const { RangePicker } = DatePicker;

    useImperativeHandle(ref, () => ({
      showModal: ({
        type,
        attrList,
        subTitle,
        title,
        formInfo,
        model_id,
        list,
      }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        setModelId(model_id);
        setFormItems(attrList);
        setInstanceData(formInfo);
        setSelectedRows(list);
        if (type === "add") {
          Object.assign(formInfo, {
            organization: organizationList[0]?.value || "",
          });
        }
        form.resetFields();
        form.setFieldsValue(formInfo);
      },
    }));

    const handleSubmit = () => {
      form.validateFields().then((values) => {
        operateAttr(values);
      });
    };

    const operateAttr = async (params: AttrFieldType) => {
      try {
        setConfirmLoading(true);
        const formData = deepClone(params);
        const msg: string = t(
          type === "add" ? "successfullyAdded" : "successfullyModified"
        );
        const url: string =
          type === "add" ? `/api/instance/` : `/api/instance/batch_update/`;
        let requestParams: RequestParams = {
          model_id: modelId,
          instance_info: formData,
        };
        if (type !== "add") {
          if (type === "batchEdit") {
            for (const key in formData) {
              if (
                !formData[key] &&
                formData[key] !== 0 &&
                formData[key] !== false
              ) {
                delete formData[key];
              }
            }
          }
          requestParams = {
            inst_ids: type === "edit" ? [instanceData._id] : selectedRows,
            update_data: formData,
          };
        }
        await post(url, requestParams);
        message.success(msg);
        onSuccess();
        handleCancel();
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    };

    const handleCancel = () => {
      setGroupVisible(false);
    };

    return (
      <div>
        <OperateModal
          title={title}
          subTitle={subTitle}
          visible={groupVisible}
          width={700}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                loading={confirmLoading}
                disabled
                onClick={handleSubmit}
              >
                {t("confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("cancel")}</Button>
            </div>
          }
        >
          <Form form={form}>
            <div className="font-[600] text-[var(--color-text-2)] text-[18px] pl-[12px] pb-[14px]">
              {t("information")}
            </div>
            <Row gutter={24}>
              {formItems
                .filter((formItem) => formItem.attr_id !== "organization")
                .map((item) => (
                  <Col span={12} key={item.attr_id}>
                    <Form.Item
                      name={item.attr_id}
                      label={item.attr_name}
                      labelCol={{ span: 7 }}
                      rules={[
                        {
                          required: item.is_required && type !== "batchEdit",
                          message: t("required"),
                        },
                      ]}
                    >
                      {(() => {
                        switch (item.attr_type) {
                          case "user":
                            return (
                              <Select
                                disabled={!item.editable && type !== "add"}
                              >
                                {userList.map((opt) => (
                                  <Select.Option key={opt.id} value={opt.id}>
                                    {opt.username}
                                  </Select.Option>
                                ))}
                              </Select>
                            );
                          case "enum":
                            return (
                              <Select
                                disabled={!item.editable && type !== "add"}
                              >
                                {item.option.map((opt) => (
                                  <Select.Option key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </Select.Option>
                                ))}
                              </Select>
                            );
                          case "bool":
                            return (
                              <Select
                                disabled={!item.editable && type !== "add"}
                              >
                                {[
                                  { id: 1, name: "Yes" },
                                  { id: 0, name: "No" },
                                ].map((opt) => (
                                  <Select.Option key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </Select.Option>
                                ))}
                              </Select>
                            );
                          case "time":
                            return (
                              <RangePicker
                                disabled={!item.editable && type !== "add"}
                                showTime={{ format: "HH:mm" }}
                                format="YYYY-MM-DD HH:mm"
                              />
                            );
                          default:
                            return (
                              <Input
                                disabled={!item.editable && type !== "add"}
                              />
                            );
                        }
                      })()}
                    </Form.Item>
                  </Col>
                ))}
            </Row>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
FieldMoadal.displayName = "fieldMoadal";
export default FieldMoadal;
