import React, { useState, useEffect } from "react";
import { Form, Button, Collapse, Descriptions, message } from "antd";
import type { DescriptionsProps } from "antd";
import { AssetDataFieldProps, AttrFieldType } from "@/types/assetManage";
import { deepClone, getFieldItem } from "@/utils/common";
import { useSearchParams } from "next/navigation";
import {
  EditOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import informationList from "./list.module.less";
import { useTranslation } from "@/utils/i18n";
import useApiClient from "@/utils/request";

const { Panel } = Collapse;

const InfoList: React.FC<AssetDataFieldProps> = ({
  propertyList,
  userList,
  organizationList,
  instDetail,
  onsuccessEdit,
}) => {
  const [form] = Form.useForm();
  const [fieldList, setFieldList] = useState<DescriptionsProps["items"]>([]);
  const [attrList, setAttrList] = useState<AttrFieldType[]>([]);
  const { t } = useTranslation();
  const { patch } = useApiClient();
  const searchParams = useSearchParams();
  const instId: string = searchParams.get("inst_id") || "";

  useEffect(() => {
    setAttrList(propertyList);
  }, [propertyList]);

  useEffect(() => {
    if (attrList.length) {
      initData(attrList);
    }
  }, [propertyList, instDetail, userList, organizationList, attrList]);

  const updateInst = async (config: {
    id: string;
    values: any;
    type: string;
  }) => {
    const fieldKey = config.id;
    const fieldVaule = config.values[fieldKey];
    const params: any = {};
    params[fieldKey] = fieldVaule;
    await patch(`/api/instance/${instId}/`, params);
    message.success(t("successfullyModified"));
    const list = deepClone(attrList);
    const index = list.findIndex(
      (item: AttrFieldType) => item.attr_id === fieldKey
    );
    const target = list.find(
      (item: AttrFieldType) => item.attr_id === fieldKey
    );
    if (
      config.type === "success" ||
      (config.type === "fail" && !target?.is_required)
    ) {
      list[index].isEdit = false;
      list[index].value = fieldVaule;
      setAttrList(list);
    }
    onsuccessEdit();
  };

  const initData = (list: any) => {
    list.forEach((item: any) => {
      item.value = item.value || instDetail[item.attr_id];
      item.key = item.attr_id;
      item.label = item.is_required ? (
        <>
          {item.attr_name}
          <span className={informationList.required}></span>
        </>
      ) : (
        <>{item.attr_name}</>
      );
      item.isEdit = item.isEdit || false;
      item.children = (
        <Form key={item.attr_id} form={form}>
          <div
            key={item.key}
            className={`flex items-center justify-between ${informationList.formItem}`}
          >
            <div className="flex items-center w-full">
              {item.isEdit ? (
                <Form.Item
                  name={item.key}
                  rules={[
                    {
                      required: item.is_required,
                      message: '',
                    },
                  ]}
                  initialValue={item.value}
                  className="mb-0 w-full"
                >
                  <>
                    {getFieldItem({
                      fieldItem: item,
                      userList,
                      groupList: organizationList,
                      isEdit: true,
                    })}
                  </>
                </Form.Item>
              ) : (
                <>
                  {getFieldItem({
                    fieldItem: item,
                    userList,
                    groupList: organizationList,
                    isEdit: false,
                    value: item.value,
                  })}
                </>
              )}
            </div>
            <div className={`flex items-center ${informationList.operateBtn}`}>
              {item.isEdit ? (
                <>
                  <Button
                    type="link"
                    size="small"
                    className="ml-[4px]"
                    icon={<CheckOutlined />}
                    onClick={() => confirmEdit(item.key)}
                  />
                  <Button
                    type="link"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => cancelEdit(item.key)}
                  />
                </>
              ) : (
                <>
                  {item.editable && (
                    <Button
                      type="link"
                      size="small"
                      className="ml-[4px]"
                      icon={<EditOutlined />}
                      onClick={() => enableEdit(item.key)}
                    />
                  )}
                  <Button
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => onCopy(item, item.value)}
                  />
                </>
              )}
            </div>
          </div>
        </Form>
      );
    });
    setFieldList(list);
  };

  const enableEdit = (id: string) => {
    const list = deepClone(attrList);
    const index = list.findIndex((item: AttrFieldType) => item.attr_id === id);
    list[index].isEdit = true;
    setAttrList(list);
  };

  const cancelEdit = (id: string) => {
    const list = deepClone(attrList);
    const index = list.findIndex((item: AttrFieldType) => item.attr_id === id);
    list[index].isEdit = false;
    const obj: any = {};
    obj[id] = list[index].value;
    form.setFieldsValue(obj);
    setAttrList(list);
  };

  const confirmEdit = (id: string) => {
    form
      .validateFields()
      .then((values) => {
        onFinish(values, id);
      })
      .catch(({ values }) => {
        onFailFinish(values, id);
      });
  };

  const onFinish = (values: any, id: string) => {
    updateInst({
      values,
      id,
      type: "success",
    });
  };

  const onFailFinish = (values: any, id: string) => {
    updateInst({
      values,
      id,
      type: "fail",
    });
  };

  const onCopy = (item: any, value: string) => {
    const copyVal: string = getFieldItem({
      fieldItem: item,
      userList,
      groupList: organizationList,
      isEdit: false,
      value,
    });
    navigator.clipboard.writeText(copyVal);
    message.success(t("successfulCopied"));
  };

  return (
    <div>
      <Collapse
        bordered={false}
        className={informationList.list}
        accordion
        defaultActiveKey="group"
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
      >
        <Panel header={t("group")} key="group">
          <Descriptions
            bordered
            items={fieldList?.filter((item) => item.key === "organization")}
            column={2}
          />
        </Panel>
      </Collapse>
      <Collapse
        bordered={false}
        className={informationList.list}
        defaultActiveKey="information"
        accordion
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
      >
        <Panel header={t("information")} key="information">
          <Descriptions
            bordered
            items={fieldList?.filter((item) => item.key !== "organization")}
            column={2}
          />
        </Panel>
      </Collapse>
    </div>
  );
};

export default InfoList;