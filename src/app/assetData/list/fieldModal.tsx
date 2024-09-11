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
        setFormItems(deepClone(attrList));
        setInstanceData(attrList);
        setSelectedRows(list);
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
        const msg: string = t(
          type === "add" ? "successfullyAdded" : "successfullyModified"
        );
        const url: string =
          type === "add" ? `/api/instance/` : `/api/instance/batch_update/`;
        let requestParams: RequestParams = {
          model_id: modelId,
          instance_info: deepClone(params),
        };
        if (type !== "add") {
          requestParams = {
            inst_ids:
              type === "edit"
                ? [instanceData.id]
                : selectedRows.map((item) => item.id),
            update_data: instanceData,
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
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {t("confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("cancel")}</Button>
            </div>
          }
        >
          <Form form={form} layout="vertical">
            {formItems.map((item) => (
              <Form.Item
                key={item.attr_id}
                name={item.attr_id}
                label={item.attr_name}
                rules={[{ required: item.is_required, message: t("required") }]}
              >
                {(() => {
                  switch (item.attr_type) {
                    case "user":
                      return (
                        <Select>
                          {userList.map((opt) => (
                            <Select.Option key={opt.id} value={opt.id}>
                              {opt.username}
                            </Select.Option>
                          ))}
                        </Select>
                      );
                    case "enum":
                      return (
                        <Select>
                          {item.option?.map((opt) => (
                            <Select.Option key={opt} value={opt}>
                              {opt}
                            </Select.Option>
                          ))}
                        </Select>
                      );
                    case "organization":
                      return (
                        <Cascader
                          style={{ width: 200 }}
                          options={organizationList}
                        />
                      );
                    case "time":
                      return (
                        <RangePicker
                          showTime={{ format: "HH:mm" }}
                          format="YYYY-MM-DD HH:mm"
                        />
                      );
                    default:
                      return <Input />;
                  }
                })()}
              </Form.Item>
            ))}
          </Form>
        </OperateModal>
      </div>
    );
  }
);
FieldMoadal.displayName = "fieldMoadal";
export default FieldMoadal;
