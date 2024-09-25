"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Input,
  Button,
  Form,
  message,
  Select,
  DatePicker,
  Col,
  Row,
  Spin,
} from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import { AttrFieldType, UserItem } from "@/types/assetManage";
import { deepClone } from "@/utils/common";
import useApiClient from "@/utils/request";
import { EditOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
interface FieldModalProps {
  onSuccess: () => void;
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
  credential_type?: string;
  data: object;
}

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const FieldMoadal = forwardRef<FieldModalRef, FieldModalProps>(
  ({ onSuccess, userList }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [formItems, setFormItems] = useState<AttrFieldType[]>([]);
    const [instanceData, setInstanceData] = useState<any>({});
    const [modelId, setModelId] = useState<string>("");
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { post, patch, get } = useApiClient();
    const { RangePicker } = DatePicker;

    useImperativeHandle(ref, () => ({
      showModal: async ({
        type,
        attrList,
        subTitle,
        title,
        formInfo,
        model_id,
      }) => {
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        setModelId(model_id);
        setFormItems(attrList);
        const processedAttrList = deepClone(attrList);
        initializeVisibility(processedAttrList);
        setFormItems(processedAttrList);
        let _formInfo = formInfo;
        if (type === "edit") {
          setLoading(true);
          try {
            _formInfo = await get(`/api/credential/${formInfo._id}/`);
            _formInfo._id = formInfo._id;
            for (const key in _formInfo) {
              const target = attrList.find((item) => item.attr_id === key);
              if (
                target?.attr_type === "time" &&
                _formInfo[key].every((item: string) => !!item)
              ) {
                _formInfo[key] = _formInfo[key].map((date: string) =>
                  dayjs(date, "YYYY-MM-DD HH:mm:ss")
                );
              }
            }
          } finally {
            setLoading(false);
          }
        }
        setInstanceData(_formInfo);
        form.resetFields();
        form.setFieldsValue(_formInfo);
      },
    }));

    const handleSubmit = () => {
      form.validateFields().then((values) => {
        for (const key in values) {
          const target = formItems.find((item) => item.attr_id === key);
          if (target?.attr_type === "time") {
            values[key] = values[key].map((date: any) =>
              date.format("YYYY-MM-DD HH:mm:ss")
            );
          }
        }
        operateAttr(values);
      });
    };

    const initializeVisibility = (items: AttrFieldType[]) => {
      items.forEach((item) => {
        if (item.children) {
          item.children.forEach((child) => {
            child.visible = false;
            if (child.children) {
              initializeVisibility(child.children);
            }
          });
        }
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
          type === "add"
            ? `/api/credential/`
            : `/api/credential/${instanceData._id}/`;
        let requestParams: RequestParams = {
          credential_type: modelId,
          data: formData,
        };
        let requestType = post;
        if (type === "edit") {
          requestType = patch;
          requestParams = formData;
        }
        await requestType(url, requestParams);
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

    const editPassword = (item: AttrFieldType) => {
      const fieldIndex = formItems.findIndex(
        (tex) => tex.attr_id === item.attr_id
      );
      const fields = deepClone(formItems);
      fields[fieldIndex].isEdit = true;
      setFormItems(fields);
    };

    const onCopy = async (item: AttrFieldType) => {
      const params = {
        id: instanceData._id,
        field: item.attr_id,
      };
      const responseData = await post(
        `/api/credential/encryption_field/`,
        params
      );
      navigator.clipboard.writeText(responseData);
      message.success(t("successfulCopied"));
    };

    const renderFormItem = (item: AttrFieldType) => {
      switch (item.attr_type) {
        case "user":
          return (
            <Select disabled={!item.editable}>
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
              disabled={!item.editable}
              onChange={(value) => handleEnumChange(item, value)}
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
            <Select disabled={!item.editable}>
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
              disabled={!item.editable}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          );
        case "pwd":
          return (
            <div className="flex items-center">
              <Form.Item name={item.attr_id} className="mb-[0px] w-full">
                <Input.Password
                  visibilityToggle={false}
                  disabled={type !== "add" && (!item.editable || !item.isEdit)}
                />
              </Form.Item>
              {!item.isEdit && type !== "add" && (
                <>
                  <EditOutlined
                    className="pl-[6px] text-[var(--color-primary)] cursor-pointer"
                    onClick={() => editPassword(item)}
                  />
                  <CopyOutlined
                    className="pl-[6px] text-[var(--color-primary)] cursor-pointer"
                    onClick={() => onCopy(item)}
                  />
                </>
              )}
            </div>
          );
        default:
          return <Input disabled={!item.editable && type !== "add"} />;
      }
    };

    const handleEnumChange = (item: AttrFieldType, value: unknown) => {
      const newFormItems = deepClone(formItems);
      const updateFormItems: any = (
        items: AttrFieldType[],
        targetItem: AttrFieldType,
        value: unknown
      ) => {
        return items.map((field) => {
          if (field.attr_id === targetItem.attr_id) {
            // 操作当前项
            if (field.children) {
              field.children.forEach((child) => {
                child.visible = child.parent_id === value;
                if (child.children) {
                  child.children.forEach((grandChild) => {
                    grandChild.visible = false;
                  });
                }
              });
            }
            // 操作目标项
            if (targetItem.children) {
              targetItem.visible = true;
              targetItem.children.forEach((grandChild) => {
                grandChild.visible = value === grandChild.parent_id;
              });
            }
            return { ...field, ...targetItem };
          } else if (field.children) {
            return {
              ...field,
              children: updateFormItems(field.children, targetItem, value),
            };
          } else {
            return field;
          }
        });
      };

      const updatedItems = updateFormItems(newFormItems, item, value);
      setFormItems(updatedItems);
    };

    const renderFormItems = (items: AttrFieldType[]) => {
      return items.map((item) => {
        if (item.visible === false) return null;
        return (
          <Col span={24} key={item.attr_id}>
            <Form.Item
              name={item.attr_id}
              label={item.attr_name}
              labelCol={{ span: 7 }}
              className="w-full"
              rules={[
                {
                  required: item.is_required,
                  message: t("required"),
                },
              ]}
            >
              {renderFormItem(item)}
            </Form.Item>
            <>{item.children && renderFormItems(item.children)}</>
          </Col>
        );
      });
    };

    return (
      <div>
        <OperateModal
          title={title}
          subTitle={subTitle}
          visible={groupVisible}
          width={500}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                loading={confirmLoading}
                disabled={loading}
                onClick={handleSubmit}
              >
                {t("confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("cancel")}</Button>
            </div>
          }
        >
          <Spin spinning={loading}>
            <Form form={form}>
              <Row gutter={24}>{renderFormItems(formItems)}</Row>
            </Form>
          </Spin>
        </OperateModal>
      </div>
    );
  }
);
FieldMoadal.displayName = "fieldMoadal";
export default FieldMoadal;
