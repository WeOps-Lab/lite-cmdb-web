'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  Input,
  Button,
  Form,
  message,
  Select,
  Cascader,
  DatePicker,
  Col,
  Row,
} from 'antd';
import OperateModal from '@/components/operate-modal';
import { useTranslation } from '@/utils/i18n';
import { AttrFieldType, Organization, UserItem } from '@/types/assetManage';
import { deepClone } from '@/utils/common';
import useApiClient from '@/utils/request';
import dayjs from 'dayjs';
interface FieldModalProps {
  onSuccess: (instId?: string) => void;
  organizationList: Organization[];
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
  model_id?: string;
  instance_info?: object;
  inst_ids?: number[];
  update_data?: object;
}

export interface FieldModalRef {
  showModal: (info: FieldConfig) => void;
}

const FieldMoadal = forwardRef<FieldModalRef, FieldModalProps>(
  ({ onSuccess, userList, organizationList }, ref) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [formItems, setFormItems] = useState<AttrFieldType[]>([]);
    const [instanceData, setInstanceData] = useState<any>({});
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [modelId, setModelId] = useState<string>('');
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const { post } = useApiClient();
    const { RangePicker } = DatePicker;

    useEffect(() => {
      if (groupVisible) {
        form.resetFields();
        form.setFieldsValue(instanceData);
      }
    }, [groupVisible, instanceData]);

    useImperativeHandle(ref, () => ({
      showModal: ({
        type,
        attrList,
        subTitle,
        title,
        formInfo,
        model_id,
        list,
      }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        setModelId(model_id);
        setFormItems(attrList);
        setSelectedRows(list);
        const forms = deepClone(formInfo);
        if (type === 'add') {
          Object.assign(forms, {
            organization: organizationList[0]?.value
              ? [organizationList[0]?.value]
              : '',
          });
        } else {
          for (const key in forms) {
            const target = attrList.find((item) => item.attr_id === key);
            if (
              target?.attr_type === 'time' &&
              forms[key].every((item: string) => !!item)
            ) {
              forms[key] = forms[key].map((date: string) =>
                dayjs(date, 'YYYY-MM-DD HH:mm:ss')
              );
            }
          }
        }
        setInstanceData(forms);
      },
    }));

    const handleSubmit = (confirmType?: string) => {
      form.validateFields().then((values) => {
        for (const key in values) {
          const target = formItems.find((item) => item.attr_id === key);
          if (target?.attr_type === 'time') {
            values[key] = values[key].map((date: any) =>
              date.format('YYYY-MM-DD HH:mm:ss')
            );
          }
        }
        operateAttr(values, confirmType);
      });
    };

    const operateAttr = async (params: AttrFieldType, confirmType?: string) => {
      try {
        setConfirmLoading(true);
        const formData = params;
        const msg: string = t(
          type === 'add' ? 'successfullyAdded' : 'successfullyModified'
        );
        const url: string =
          type === 'add' ? `/api/instance/` : `/api/instance/batch_update/`;
        let requestParams: RequestParams = {
          model_id: modelId,
          instance_info: formData,
        };
        if (type !== 'add') {
          if (type === 'batchEdit') {
            for (const key in formData) {
              if (
                !formData[key] &&
                formData[key] !== 0 &&
                formData[key] !== false
              ) {
                delete formData[key];
              }
            }
          }
          requestParams = {
            inst_ids: type === 'edit' ? [instanceData._id] : selectedRows,
            update_data: formData,
          };
        }
        const { _id: instId } = await post(url, requestParams);
        message.success(msg);
        onSuccess(confirmType ? instId : '');
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

    return (
      <div>
        <OperateModal
          title={title}
          subTitle={subTitle}
          visible={groupVisible}
          width={900}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                className="mr-[10px]"
                type="primary"
                loading={confirmLoading}
                onClick={() => handleSubmit()}
              >
                {t('confirm')}
              </Button>
              <Button
                className="mr-[10px]"
                loading={confirmLoading}
                onClick={() => handleSubmit('associate')}
              >
                {t('Model.confirmAndAssociate')}
              </Button>
              <Button onClick={handleCancel}>{t('cancel')}</Button>
            </div>
          }
        >
          <Form form={form}>
            <div className="font-[600] text-[var(--color-text-2)] text-[18px] pl-[12px] pb-[14px]">
              {t('group')}
            </div>
            <Row gutter={24}>
              {formItems
                .filter((formItem) => formItem.attr_id === 'organization')
                .map((item) => (
                  <Col span={12} key={item.attr_id}>
                    <Form.Item
                      name={item.attr_id}
                      label={item.attr_name}
                      labelCol={{ span: 8 }}
                      rules={[
                        {
                          required: item.is_required && type !== 'batchEdit',
                          message: t('required'),
                        },
                      ]}
                    >
                      <Cascader
                        showSearch
                        disabled={!item.editable && type !== 'add'}
                        options={organizationList}
                      />
                    </Form.Item>
                  </Col>
                ))}
            </Row>
            <div className="font-[600] text-[var(--color-text-2)] text-[18px] pl-[12px] pb-[14px]">
              {t('information')}
            </div>
            <Row gutter={24}>
              {formItems
                .filter((formItem) => formItem.attr_id !== 'organization')
                .map((item) => (
                  <Col span={12} key={item.attr_id}>
                    <Form.Item
                      name={item.attr_id}
                      label={item.attr_name}
                      labelCol={{ span: 7 }}
                      rules={[
                        {
                          required: item.is_required && type !== 'batchEdit',
                          message: t('required'),
                        },
                      ]}
                    >
                      {(() => {
                        switch (item.attr_type) {
                          case 'user':
                            return (
                              <Select
                                showSearch
                                disabled={!item.editable && type !== 'add'}
                              >
                                {userList.map((opt) => (
                                  <Select.Option key={opt.id} value={opt.id}>
                                    {opt.username}
                                  </Select.Option>
                                ))}
                              </Select>
                            );
                          case 'enum':
                            return (
                              <Select
                                disabled={!item.editable && type !== 'add'}
                              >
                                {item.option?.map((opt) => (
                                  <Select.Option key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </Select.Option>
                                ))}
                              </Select>
                            );
                          case 'bool':
                            return (
                              <Select
                                disabled={!item.editable && type !== 'add'}
                              >
                                {[
                                  { id: 1, name: 'Yes' },
                                  { id: 0, name: 'No' },
                                ].map((opt) => (
                                  <Select.Option key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </Select.Option>
                                ))}
                              </Select>
                            );
                          case 'time':
                            return (
                              <RangePicker
                                showTime
                                disabled={!item.editable && type !== 'add'}
                                format="YYYY-MM-DD HH:mm:ss"
                              />
                            );
                          default:
                            return (
                              <Input
                                disabled={
                                  (!item.editable && type !== 'add') ||
                                  (type === 'batchEdit' &&
                                    item.attr_id === 'inst_name')
                                }
                              />
                            );
                        }
                      })()}
                    </Form.Item>
                  </Col>
                ))}
            </Row>
          </Form>
        </OperateModal>
      </div>
    );
  }
);
FieldMoadal.displayName = 'fieldMoadal';
export default FieldMoadal;
