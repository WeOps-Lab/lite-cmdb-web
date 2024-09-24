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
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        setModelId(model_id);
        setFormItems(attrList);
        let _formInfo = formInfo;
        if (type === "edit") {
          setLoading(true);
          try {
            _formInfo = await get(`/api/credential/${formInfo._id}/`);
            _formInfo._id = formInfo._id;
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

    const onCopy = async (item: any, value: string) => {
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
                            required: item.is_required,
                            message: t("required"),
                          },
                        ]}
                      >
                        {(() => {
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
                                <Select disabled={!item.editable}>
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
                                  showTime={{ format: "HH:mm" }}
                                  format="YYYY-MM-DD HH:mm"
                                />
                              );
                            case "pwd":
                              return (
                                <div className="flex items-center">
                                  <Form.Item
                                    name={item.attr_id}
                                    className="mb-[0px]"
                                  >
                                    <Input.Password
                                      visibilityToggle={false}
                                      disabled={
                                        type !== "add" &&
                                        (!item.editable || !item.isEdit)
                                      }
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
                                        onClick={() =>
                                          onCopy(
                                            item,
                                            instanceData[item.attr_id]
                                          )
                                        }
                                      />
                                    </>
                                  )}
                                </div>
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
          </Spin>
        </OperateModal>
      </div>
    );
  }
);
FieldMoadal.displayName = "fieldMoadal";
export default FieldMoadal;
