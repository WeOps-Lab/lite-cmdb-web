"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button, Form, message, Select } from "antd";
import OperateModal from "@/components/operate-modal";
import Image from "next/image";
import { getIconUrl } from "@/utils/common";
import type { FormInstance } from "antd";
import associationsModalStyle from "./associationsModal.module.less";
import { deepClone } from "@/utils/common";
import useApiClient from "@/utils/request";
const { Option } = Select;
import { AssoTypeItem, ModelItem, AssoFieldType } from "@/types/assetManage";

interface AssoModalProps {
  onSuccess: () => void;
  constraintList: Array<{ id: string; name: string }>;
  allModelList: ModelItem[];
  assoTypeList: AssoTypeItem[];
}

interface AssoConfig {
  type: string;
  assoInfo: any;
  subTitle: string;
  title: string;
}

export interface AssoModalRef {
  showModal: (info: AssoConfig) => void;
}

const AssociationsModal = forwardRef<AssoModalRef, AssoModalProps>(
  ({ onSuccess, constraintList, allModelList, assoTypeList }, ref) => {
    const [modelVisible, setModelVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [assoInfo, setAssoInfo] = useState<any>({});
    const formRef = useRef<FormInstance>(null);
    const { post } = useApiClient();

    useEffect(() => {
      if (modelVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(assoInfo);
      }
    }, [modelVisible, assoInfo]);

    useImperativeHandle(ref, () => ({
      showModal: ({ assoInfo, subTitle, title }) => {
        // 开启弹窗的交互
        setModelVisible(true);
        setSubTitle(subTitle);
        setTitle(title);
        setAssoInfo(assoInfo);
      },
    }));

    const showModelKeyName = (id: string, key: string) => {
      return allModelList.find((item) => item.model_id === id)?.[key] || "--";
    };

    const showAssoType = (id: string) => {
      const target = assoTypeList.find((item) => item.asst_id === id);
      if (target) {
        return `${target.asst_name}(${target.asst_id})`;
      }
      return "--";
    };

    const operateRelationships = async (params: AssoFieldType) => {
      try {
        setConfirmLoading(true);
        const requestParams = deepClone(params);
        const { result } = await post("/api/model/association/", requestParams);
        if (result) {
          message.success("New successfully added !");
          onSuccess();
          handleCancel();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    };

    const handleSubmit = () => {
      formRef.current?.validateFields().then((values) => {
        operateRelationships(values);
      });
    };

    const handleCancel = () => {
      setModelVisible(false);
    };

    return (
      <div>
        <OperateModal
          title={title}
          width={600}
          subTitle={subTitle}
          visible={modelVisible}
          onCancel={handleCancel}
          footer={
            <div>
              <Button className="mr-[10px]" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                Confirm
              </Button>
            </div>
          }
        >
          <Form
            className={associationsModalStyle.associationsModal}
            ref={formRef}
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item<AssoFieldType>
              label="Source Model"
              name="src_model_id"
              rules={[
                { required: true, message: "Please select the Source Model !" },
              ]}
            >
              <Select placeholder="Please select the Source Model" allowClear>
                {allModelList.map((item) => {
                  return (
                    <Option value={item.model_id} key={item.model_id}>
                      {item.model_name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item<AssoFieldType>
              label="Target Model"
              name="dst_model_id"
              rules={[
                { required: true, message: "Please select the Target Model !" },
              ]}
            >
              <Select placeholder="Please select the Target Model" allowClear>
                {allModelList.map((item) => {
                  return (
                    <Option value={item.model_id} key={item.model_id}>
                      {item.model_name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item<AssoFieldType>
              label="Association Type"
              name="asst_id"
              rules={[
                {
                  required: true,
                  message: "Please select an Association Type !",
                },
              ]}
            >
              <Select
                placeholder="Please select an Association type"
                allowClear
              >
                {assoTypeList.map((item) => {
                  return (
                    <Option value={item.asst_id} key={item.asst_id}>
                      {`${item.asst_name}(${item.asst_id})`}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item<AssoFieldType>
              label="Constraint"
              name="mapping"
              rules={[
                {
                  required: true,
                  message: "Please select the constraint !",
                },
              ]}
            >
              <Select placeholder="Please select the constraint">
                {constraintList.map((item) => {
                  return (
                    <Option value={item.id} key={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.asst_id !== currentValues.asst_id ||
                prevValues.dst_model_id !== currentValues.dst_model_id ||
                prevValues.src_model_id !== currentValues.src_model_id
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("asst_id") &&
                getFieldValue("dst_model_id") &&
                getFieldValue("src_model_id") ? (
                    <Form.Item<AssoFieldType> label="Effect">
                      <div
                        className={associationsModalStyle.effectRepresentation}
                      >
                        <div className={associationsModalStyle.modelObject}>
                          <div className="mb-[4px]">
                            <Image
                              src={getIconUrl({
                                icn: showModelKeyName(
                                  getFieldValue("src_model_id"),
                                  "icn"
                                ),
                                model_id: getFieldValue("src_model_id"),
                              })}
                              className="block bg-[var(--color-bg-1)] p-[6px] rounded-[50%]"
                              alt="源"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span
                            className={associationsModalStyle.modelObjectName}
                          >
                            {showModelKeyName(
                              getFieldValue("src_model_id"),
                              "model_name"
                            )}
                          </span>
                        </div>
                        <div className={associationsModalStyle.modelEdge}>
                          <div className={associationsModalStyle.connection}>
                            <span className={associationsModalStyle.name}>
                              {showAssoType(getFieldValue("asst_id"))}
                            </span>
                          </div>
                        </div>
                        <div className={associationsModalStyle.modelObject}>
                          <div className="mb-[4px]">
                            <Image
                              src={getIconUrl({
                                icn: showModelKeyName(
                                  getFieldValue("dst_model_id"),
                                  "icn"
                                ),
                                model_id: getFieldValue("dst_model_id"),
                              })}
                              className="block bg-[var(--color-bg-1)] p-[6px] rounded-[50%]"
                              alt="目标"
                              width={40}
                              height={40}
                            />
                          </div>
                          <span
                            className={associationsModalStyle.modelObjectName}
                          >
                            {showModelKeyName(
                              getFieldValue("dst_model_id"),
                              "model_name"
                            )}
                          </span>
                        </div>
                      </div>
                    </Form.Item>
                  ) : null
              }
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
AssociationsModal.displayName = "associationsModal";
export default AssociationsModal;
