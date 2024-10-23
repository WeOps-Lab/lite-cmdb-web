'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import {
  Select,
  Button,
  message,
  TablePaginationConfig,
  Spin,
  Modal,
} from 'antd';
import OperateModal from '@/components/operate-modal';
import { useTranslation } from '@/utils/i18n';
import {
  AttrFieldType,
  UserItem,
  Organization,
  ModelItem,
  ColumnItem,
  AssoTypeItem,
  AssoFieldType,
  ListItem,
  RelationListInstItem,
  CrentialsAssoInstItem,
  RelationInstanceRef,
} from '@/types/assetManage';
import { getAssetColumns } from '@/utils/common';
import useApiClient from '@/utils/request';
import SearchFilter from '@/app/assetData/list/searchFilter';
import CustomTable from '@/components/custom-table';
const { Option } = Select;
const { confirm } = Modal;

interface FieldModalProps {
  onSuccess?: () => void;
  userList: UserItem[];
  organizationList: Organization[];
  models: ModelItem[];
  assoTypes: AssoTypeItem[];
  needFetchAssoInstIds?: boolean;
}

const SelectInstance = forwardRef<RelationInstanceRef, FieldModalProps>(
  (
    {
      onSuccess,
      userList,
      organizationList,
      models,
      assoTypes,
      needFetchAssoInstIds,
    },
    ref
  ) => {
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [title, setTitle] = useState<string>('');
    const [assoModelId, setAssoModelId] = useState<string>('');
    const [instId, setInstId] = useState<string>('');
    const [modelId, setModelId] = useState<string>('');
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [columns, setColumns] = useState<ColumnItem[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [queryList, setQueryList] = useState<unknown>(null);
    const [relationList, setRelationList] = useState<ListItem[]>([]);
    const [assoInstIds, setAssoInstIds] = useState<RelationListInstItem[]>([]);
    const [intancePropertyList, setIntancePropertyList] = useState<
      AttrFieldType[]
    >([]);
    const { t } = useTranslation();
    const { post, get, del } = useApiClient();

    useEffect(() => {
      if (modelId) {
        fetchData();
      }
    }, [pagination?.current, pagination?.pageSize, queryList]);

    useEffect(() => {
      if (relationList.length && assoModelId && intancePropertyList.length) {
        const columns = [
          ...getAssetColumns({
            attrList: intancePropertyList,
            userList,
            groupList: organizationList,
            t,
          }),
          {
            title: t('action'),
            dataIndex: 'action',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_: unknown, record: any) => {
              const isRelated = !!assoInstIds.find(
                (item) => item.id === record._id
              );
              return (
                <Button
                  type="link"
                  onClick={() => handleRelate(record, isRelated)}
                >
                  {t(isRelated ? 'Model.disassociation' : 'Model.association')}
                </Button>
              );
            },
          },
        ];
        columns[0].fixed = true;
        setColumns(columns);
      }
    }, [relationList, assoModelId, intancePropertyList, assoInstIds]);

    useImperativeHandle(ref, () => ({
      showModal: async ({ title, model_id, list, instId }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setTitle(title);
        setModelId(model_id);
        setInstId(instId);
        setAssoInstIds(list);
        setLoading(true);
        try {
          const getAssoModelList = get(`/api/model/${model_id}/association/`);
          Promise.all([
            getAssoModelList,
            needFetchAssoInstIds &&
              get(
                `/api/instance/association_instance_list/${model_id}/${instId}/`
              ),
          ])
            .then((res) => {
              const relationData = res[0].map((item: AssoFieldType) => {
                return {
                  ...item,
                  name: `${showModelName(item.src_model_id)}-${showConnectType(
                    item.asst_id,
                    'asst_name'
                  )}-${showModelName(item.dst_model_id)}`,
                  id:
                    item.src_model_id === model_id
                      ? item.dst_model_id
                      : item.src_model_id,
                };
              });
              const currentAssoModelId = relationData[0]?.id || '';
              setRelationList(relationData);
              setAssoModelId(currentAssoModelId);
              initPage(currentAssoModelId);
              if (needFetchAssoInstIds) {
                const assoIds = res[1].reduce(
                  (pre: RelationListInstItem[], cur: CrentialsAssoInstItem) => {
                    const allInstIds = cur.inst_list.map((item) => ({
                      id: item._id,
                      inst_asst_id: item.inst_asst_id,
                    }));
                    pre = [...pre, ...allInstIds];
                    return pre;
                  },
                  []
                );
                setAssoInstIds(assoIds);
              }
            })
            .catch(() => {
              setLoading(false);
            });
        } catch (error) {
          setLoading(false);
        }
      },
    }));

    const initPage = async (modelId: string) => {
      setLoading(true);
      try {
        const params = getTableParams();
        params.model_id = modelId;
        const attrList = get(`/api/model/${modelId}/attr_list/`);
        const getInstanseList = post(`/api/instance/search/`, params);
        Promise.all([attrList, getInstanseList])
          .then((res) => {
            setIntancePropertyList(res[0]);
            setTableData(res[1].insts);
            pagination.total = res[1].count;
            setPagination(pagination);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      } catch {
        setLoading(false);
      }
    };

    const showModelName = (id: string) => {
      return models.find((item) => item.model_id === id)?.model_name || '--';
    };
    const showConnectType = (id: string, key: string) => {
      return assoTypes.find((item) => item.asst_id === id)?.[key] || '--';
    };

    const handleRelate = async (row = { _id: '' }, isRelated: boolean) => {
      if (isRelated) {
        cancelRelate(row._id);
        return;
      }
      setTableLoading(true);
      try {
        const target = relationList.find((item) => item.id === assoModelId);
        const params = {
          model_asst_id: target?.model_asst_id,
          src_model_id: target?.src_model_id,
          dst_model_id: target?.dst_model_id,
          asst_id: target?.asst_id,
          src_inst_id: target?.src_model_id === modelId ? +instId : row._id,
          dst_inst_id: target?.dst_model_id === modelId ? +instId : row._id,
        };
        await post(`/api/instance/association/`, params);
        message.success(t('successfullyAssociated'));
        handleCancel();
        onSuccess && onSuccess();
      } finally {
        setTableLoading(false);
      }
    };

    const cancelRelate = async (id: unknown) => {
      confirm({
        title: t('disassociationTitle'),
        content: t('deleteContent'),
        centered: true,
        onOk() {
          return new Promise(async (resolve) => {
            try {
              const instAsstId = assoInstIds.find(
                (item) => item.id === id
              )?.inst_asst_id;
              await del(`/api/instance/association/${instAsstId}/`);
              message.success(t('successfullyDisassociated'));
              handleCancel();
              onSuccess && onSuccess();
            } finally {
              resolve(true);
            }
          });
        },
      });
    };

    const fetchData = async () => {
      setTableLoading(true);
      const params = getTableParams();
      try {
        const data = await post(`/api/instance/search/`, params);
        setTableData(data.insts);
        pagination.total = data.count;
        setPagination(pagination);
      } catch (error) {
        console.log(error);
      } finally {
        setTableLoading(false);
      }
    };

    const getTableParams = () => {
      return {
        query_list: queryList ? [queryList] : [],
        page: pagination.current,
        page_size: pagination.pageSize,
        order: '',
        model_id: assoModelId,
        role: '',
      };
    };

    const handleCancel = () => {
      setGroupVisible(false);
    };

    const handleSearch = (condition: unknown) => {
      setQueryList(condition);
    };

    const handleTableChange = (pagination = {}) => {
      setPagination(pagination);
    };

    const handleModelChange = (model: string) => {
      setAssoModelId(model);
      initPage(model);
    };

    return (
      <div>
        <OperateModal
          title={title}
          visible={groupVisible}
          width={900}
          onCancel={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t('cancel')}</Button>
            </div>
          }
        >
          <Spin spinning={loading}>
            <div>
              <div>
                <div className="flex items-center justify-between mb-[10px]">
                  <Select
                    className="w-[300px]"
                    value={assoModelId}
                    onChange={handleModelChange}
                  >
                    {relationList.map((item) => {
                      return (
                        <Option value={item.id} key={item.id}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                  <SearchFilter
                    userList={userList}
                    attrList={intancePropertyList}
                    organizationList={organizationList}
                    onSearch={handleSearch}
                  />
                </div>
                <CustomTable
                  dataSource={tableData}
                  columns={columns}
                  pagination={pagination}
                  loading={tableLoading}
                  rowKey="_id"
                  scroll={{ x: 840, y: 'calc(100vh - 400px)' }}
                  onChange={handleTableChange}
                />
              </div>
            </div>
          </Spin>
        </OperateModal>
      </div>
    );
  }
);
SelectInstance.displayName = 'fieldMoadal';
export default SelectInstance;
