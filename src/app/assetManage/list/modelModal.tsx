"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input, Button, Form, message, Select } from "antd";
import Image from "next/image";
import OperateModal from "@/components/operate-modal";
import SelectIcon from "./selectIcon";
import { getIconUrl } from "@/utils/common";
import type { FormInstance } from "antd";
const { Option } = Select;

interface ModelFieldType {
  model_id?: string;
  model_name?: string;
  classification_id?: string;
}

interface ModelModalProps {
  onSuccess: (type: string) => void;
  groupList: Array<any>;
}

interface ModelConfig {
  type: string;
  groupInfo: any;
  subTitle: string;
  title: string;
}

export interface ModelModalRef {
  showModal: (info: ModelConfig) => void;
}

const ModelModal = forwardRef<ModelModalRef, ModelModalProps>(
  ({ onSuccess, groupList }, ref) => {
    const [modelVisible, setModelVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [groupInfo, setGroupInfo] = useState<any>({});
    const [modelIcon, setModelIcon] = useState<any>("");
    const [iconId, setIconId] = useState<any>("");
    const formRef = useRef<FormInstance>(null);
    const selectIconRef = useRef<any>(null);

    useEffect(() => {
      if (modelVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(groupInfo);
      }
    }, [modelVisible, groupInfo]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, groupInfo, subTitle, title }) => {
        // 开启弹窗的交互
        setModelVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        let icon = getIconUrl({ bk_obj_icon: "", bk_obj_id: "" });
        if (type === "edit") {
          icon = getIconUrl({
            bk_obj_icon: groupInfo.objIcon,
            bk_obj_id: groupInfo.model_id,
          });
        }
        setModelIcon(icon);
        setIconId("cc-host");
        setGroupInfo(groupInfo);
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

    const onConfirmSelectIcon = (icon: string) => {
      const objId = icon.replace("cc-", "");
      setModelIcon(
        getIconUrl({
          bk_obj_icon: "icon-" + icon,
          bk_obj_id: objId,
        })
      );
      setIconId(icon);
    };

    const onSelectIcon = () => {
      selectIconRef.current?.showModal({
        title: "Select the icon",
        defaultIcon: iconId,
      });
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
          <div className="flex items-center justify-center flex-col">
            <div
              className="flex items-center justify-center cursor-pointer w-[80px] h-[80px] rounded-full border-solid border-[1px] border-[var(--color-border)]"
              onClick={onSelectIcon}
            >
              <Image
                src={modelIcon}
                className="block w-auto h-10"
                alt="图标"
                width={60}
                height={60}
              />
            </div>
            <span className="text-[var(--color-text-3)] mt-[10px] mb-[20px]">
              Select the icon
            </span>
          </div>
          <Form
            ref={formRef}
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item<ModelFieldType>
              label="Group"
              name="classification_id"
              rules={[{ required: true, message: "Please input your group!" }]}
            >
              <Select placeholder="Please select a country">
                {groupList.map((item) => {
                  return (
                    <Option
                      value={item.classification_id}
                      key={item.classification_id}
                    >
                      {item.classification_name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item<ModelFieldType>
              label="ID"
              name="model_id"
              rules={[{ required: true, message: "Please input your id!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<ModelFieldType>
              label="Name"
              name="model_name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </OperateModal>
        <SelectIcon
          ref={selectIconRef}
          onSelect={(icon) => onConfirmSelectIcon(icon)}
        />
      </div>
    );
  }
);
ModelModal.displayName = "ModelModal";
export default ModelModal;
