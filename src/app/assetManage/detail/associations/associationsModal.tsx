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
const { Option } = Select;

interface AssoFieldType {
  id: string;
  source_model_id: string;
  target_model_id: string;
  type: string;
  constraint: string;
}

interface ModelListType {
  model_id: string;
  model_name: string;
}

interface AssoTypeList {
  model_id: string;
  model_name: string;
  obj_asst_id: string;
  asst_id: string;
  asst_name: string;
  [key: string]: any;
}

interface AssoModalProps {
  onSuccess: (type: string) => void;
  constraintList: Array<{ id: string; name: string }>;
  allModelList: ModelListType[];
  assoTypeList: AssoTypeList[];
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
    const [type, setType] = useState<string>("");
    const [assoInfo, setAssoInfo] = useState<any>({});
    const formRef = useRef<FormInstance>(null);

    useEffect(() => {
      if (modelVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(assoInfo);
      }
    }, [modelVisible, assoInfo]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, assoInfo, subTitle, title }) => {
        // 开启弹窗的交互
        setModelVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        if (type === "add") {
          Object.assign(assoInfo, {
            is_required: false,
          });
        }
        setAssoInfo(assoInfo);
      },
    }));

    const handleSubmit = () => {
      formRef.current?.validateFields().then((values) => {
        const msg: string =
          type === "add"
            ? "New successfully added !"
            : "Modified successfully !";
        message.success(msg);
        onSuccess(values);
        handleCancel();
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
              <Button type="primary" onClick={handleSubmit}>
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
              name="source_model_id"
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
              name="target_model_id"
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
              name="type"
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
                    <Option value={item.obj_asst_id} key={item.obj_asst_id}>
                      {`${item.asst_name}(${item.asst_id})`}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item<AssoFieldType>
              label="Constraint"
              name="constraint"
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
                prevValues.type !== currentValues.type ||
                prevValues.target_model_id !== currentValues.target_model_id ||
                prevValues.source_model_id !== currentValues.source_model_id
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("type") && getFieldValue("target_model_id") && getFieldValue("source_model_id") ? (
                  <Form.Item<AssoFieldType> label="Effect">
                    <div
                      className={associationsModalStyle.effectRepresentation}
                    >
                      <div className={associationsModalStyle.modelObject}>
                        <div className="mb-[4px]">
                          <Image
                            src={getIconUrl({
                              bk_obj_icon: "",
                              bk_obj_id: "",
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
                          {getFieldValue("source_model_id")}
                        </span>
                      </div>
                      <div className={associationsModalStyle.modelEdge}>
                        <div className={associationsModalStyle.connection}>
                          <span className={associationsModalStyle.name}>
                            {getFieldValue("type")}
                          </span>
                        </div>
                      </div>
                      <div className={associationsModalStyle.modelObject}>
                        <div className="mb-[4px]">
                          <Image
                            src={getIconUrl({
                              bk_obj_icon: "",
                              bk_obj_id: "",
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
                          {getFieldValue("target_model_id")}
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
