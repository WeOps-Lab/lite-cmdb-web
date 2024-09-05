"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input, Button, Form, message } from "antd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";

interface GroupFieldType {
  classification_id?: string;
  classification_name?: string;
}

interface GroupModalProps {
  onSuccess: (type: string) => void;
}

interface GroupConfig {
  type: string;
  groupInfo: unknown;
  subTitle: string;
  title: string;
}

export interface GroupModalRef {
  showModal: (info: GroupConfig) => void;
}

const GroupMoadal = forwardRef<GroupModalRef, GroupModalProps>(
  ({ onSuccess }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const formRef = useRef<FormInstance>(null);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, groupInfo, subTitle, title }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(groupInfo);
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
      setGroupVisible(false);
    };

    useEffect(() => {
      return () => {
        console.log("Component unmounted");
      };
    }, []);

    return (
      <div>
        <OperateModal
          title={title}
          subTitle={subTitle}
          visible={groupVisible}
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
            ref={formRef}
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item<GroupFieldType>
              label="ID"
              name="classification_id"
              rules={[{ required: true, message: "Please input your id!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<GroupFieldType>
              label="Name"
              name="classification_name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
GroupMoadal.displayName = "GroupMoadal";
export default GroupMoadal;
