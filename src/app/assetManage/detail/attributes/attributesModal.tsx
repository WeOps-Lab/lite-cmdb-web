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
const { Option } = Select;

interface AttrFieldType {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  is_editable: boolean;
  is_unique: boolean;
  enum_list: Array<string>;
}

interface AttrModalProps {
  onSuccess: (type: string) => void;
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
    const formRef = useRef<FormInstance>(null);

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
            is_editable: false,
            is_unique: false,
          });
          setEnumList([""]);
        }
        setAttrInfo(attrInfo);
      },
    }));

    const handleSubmit = () => {
      formRef.current?.validateFields().then((values) => {
        const msg: string =
          type === "add"
            ? "New successfully added !"
            : "Modified successfully !";
        message.success(msg);
        onSuccess({ ...values, enum_list: enumList });
        handleCancel();
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
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="ID"
              name="id"
              rules={[{ required: true, message: "Please input your id!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<AttrFieldType>
              label="Type"
              name="type"
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
                    name="enum_list"
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
                                    <HolderOutlined className="mr-[4px]"/>
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
              name="is_editable"
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
              name="is_unique"
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
