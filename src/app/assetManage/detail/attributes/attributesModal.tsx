"use client";

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input, Button, Form, message, Select, Radio } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";
import { PlusOutlined, DeleteTwoTone, HolderOutlined } from "@ant-design/icons";
import { deepClone } from "@/utils/common";
import useApiClient from "@/utils/request";
import { useSearchParams } from "next/navigation";
const { Option } = Select;

interface AttrFieldType {
  model_id: string;
  attr_id: string;
  attr_name: string;
  attr_type: string;
  is_only: boolean;
  is_required: boolean;
  editable: boolean;
  option: Array<string>;
  attr_group: string;
}

interface AttrModalProps {
  onSuccess: (type?: unknown) => void;
  attrTypeList: Array<{ id: string; name: string }>;
}

interface AttrConfig {
  type: string;
  attrInfo: any;
  subTitle: string;
  title: string;
}

export interface AttrModalRef {
  showModal: (info: AttrConfig) => void;
}

const AttributesModal = forwardRef<AttrModalRef, AttrModalProps>(
  ({ onSuccess, attrTypeList }, ref) => {
    const [modelVisible, setModelVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [attrInfo, setAttrInfo] = useState<any>({});
    const [enumList, setEnumList] = useState<string[]>([""]);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const formRef = useRef<FormInstance>(null);
    const { post, put } = useApiClient();
    const searchParams = useSearchParams();
    const classificationId: string =
      searchParams.get("classification_id") || "";
    const modelId: string =
      searchParams.get("model_id") || "";

    useEffect(() => {
      if (modelVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(attrInfo);
      }
    }, [modelVisible, attrInfo]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, attrInfo, subTitle, title }) => {
        // 开启弹窗的交互
        setModelVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        if (type === "add") {
          Object.assign(attrInfo, {
            is_required: false,
            editable: false,
            is_only: false,
          });
          setEnumList([""]);
        }
        setAttrInfo(attrInfo);
      },
    }));

    const handleSubmit = () => {
      formRef.current?.validateFields().then((values) => {
        operateAttr({
          ...values,
          option: '',
          attr_group: classificationId,
          model_id: modelId
        });
      });
    };

    // 自定义验证枚举列表
    const validateEnumList = async () => {
      if (enumList.some((item) => !item)) {
        return Promise.reject(new Error("The value cannot be empty"));
      }
      return Promise.resolve();
    };

    const handleCancel = () => {
      setModelVisible(false);
    };

    const addEnumItem = () => {
      const enumTypeList = deepClone(enumList);
      enumTypeList.push("");
      setEnumList(enumTypeList);
    };

    const deleteEnumItem = (index: number) => {
      const enumTypeList = deepClone(enumList);
      enumTypeList.splice(index, 1);
      setEnumList(enumTypeList);
    };

    const onEnumValChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const enumTypeList = deepClone(enumList);
      enumTypeList[index] = e.target.value;
      setEnumList(enumTypeList);
    };

    const onDragEnd = (result: any) => {
      if (!result.destination) return;
      const items = Array.from(enumList);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setEnumList(items);
    };

    const operateAttr = async (params: AttrFieldType) => {
      try {
        setConfirmLoading(true);
        const msg: string =
          type === "add"
            ? "New successfully added !"
            : "Modified successfully !";
        const url: string =
          type === "add"
            ? `/api/model/${params.model_id}/attr/`
            : `/api/model/${params.model_id}/attr_update/`;
        const requestParams = deepClone(params);
        const requestType = type === "add" ? post : put;
        const { result } = await requestType(url, requestParams);
        if (result) {
          message.success(msg);
          onSuccess();
          handleCancel();
        }
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    };

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
          <Form
            ref={formRef}
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item<AttrFieldType>
              label="Name"
              name="attr_name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="ID"
              name="attr_id"
              rules={[{ required: true, message: "Please input your id!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="Type"
              name="attr_type"
              rules={[{ required: true, message: "Please select a type!" }]}
            >
              <Select placeholder="Please select a type">
                {attrTypeList.map((item) => {
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
                prevValues.type !== currentValues.type
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("type") === "enum" ? (
                  <Form.Item<AttrFieldType>
                    label="Value"
                    name="option"
                    rules={[{ validator: validateEnumList }]}
                  >
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="enumList">
                        {(provided: any) => (
                          <ul
                            className="bg-[var(--color-bg-hover)] p-[10px]"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {enumList.map((enumItem, index) => (
                              <Draggable
                                key={index}
                                draggableId={`item-${index}`}
                                index={index}
                              >
                                {(provided: any) => (
                                  <li
                                    className={`flex ${
                                      index ? "mt-[10px]" : ""
                                    }`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <HolderOutlined className="mr-[4px]" />
                                    <Input
                                      className="mr-[10px] w-4/5"
                                      value={enumItem}
                                      onChange={(e) =>
                                        onEnumValChange(e, index)
                                      }
                                    />
                                    <PlusOutlined
                                      className="edit mr-[10px] cursor-pointer text-[var(--color-primary)]"
                                      onClick={addEnumItem}
                                    />
                                    {index ? (
                                      <DeleteTwoTone
                                        className="delete cursor-pointer"
                                        onClick={() => deleteEnumItem(index)}
                                      />
                                    ) : null}
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="Editable"
              name="editable"
              rules={[
                { required: true, message: "Please select the Editable!" },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="Unique"
              name="is_only"
              rules={[{ required: true, message: "Please select the Unique!" }]}
            >
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="Require"
              name="is_required"
              rules={[
                { required: true, message: "Please select the Require!" },
              ]}
            >
              <Radio.Group>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
AttributesModal.displayName = "attributesModal";
export default AttributesModal;
