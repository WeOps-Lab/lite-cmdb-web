"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input, Button, Form, message } from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";

interface FieldType {
  name?: string;
  age?: string;
}

interface FieldModalProps {
  onSuccess: (type: string) => void;
}

interface FieldConfig {
  type: string;
  groupInfo: unknown;
  subTitle: string;
  title: string;
}

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const FieldMoadal = forwardRef<FieldModalRef, FieldModalProps>(
  ({ onSuccess }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      showModal: ({ type, groupInfo, subTitle, title }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        form.resetFields();
        form.setFieldsValue(groupInfo);
      },
    }));

    const handleSubmit = () => {
      form.validateFields().then((values) => {
        const msg: string = t(
          type === "add" ? "successfullyAdded" : "successfullyModified"
        );
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
              <Button
                className="mr-[10px]"
                type="primary"
                onClick={handleSubmit}
              >
                {t("confirm")}
              </Button>
              <Button onClick={handleCancel}>{t("cancel")}</Button>
            </div>
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item<FieldType>
              name="name"
              label="Name"
              rules={[{ required: true, message: t("required") }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
FieldMoadal.displayName = "fieldMoadal";
export default FieldMoadal;
