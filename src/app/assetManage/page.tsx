'use client';

import React, { useState, useEffect, useRef } from 'react';
import Introduction from '@/components/introduction';
import { Input, Button, Modal, message, Spin, Empty } from 'antd';
import { deepClone } from '@/utils/common';
import { GroupItem, ModelItem } from '@/types/assetManage';
import {
  EditTwoTone,
  DeleteTwoTone,
  SwitcherOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import assetManageStyle from './index.module.less';
import { getIconUrl } from '@/utils/common';
import GroupModal from './list/groupModal';
import ModelModal from './list/modelModal';
import { useRouter } from 'next/navigation';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';

const AssetManage = () => {
  const [modelGroup, setModelGroup] = useState<GroupItem[]>([]);
  const [groupList, setGroupList] = useState<GroupItem[]>([]);
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [dragItem, setDragItem] = useState<any>({});
  const [dragOverItem, setDragOverItem] = useState<any>({});
  const groupRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const router = useRouter();
  const { get, del, isLoading } = useApiClient();
  const { confirm } = Modal;
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading) return;
    getModelGroup();
  }, [get, isLoading]);

  const showDeleteConfirm = (row: GroupItem) => {
    confirm({
      title: t('deleteTitle'),
      content: t('deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve, reject) => {
          try {
            await del(`/api/classification/${row.classification_id}/`);
            message.success(t('successfullyDeleted'));
            getModelGroup();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const showGroupModal = (type: string, row = {}) => {
    const title = t(type === 'add' ? 'Model.addGroup' : 'Model.editGroup');
    groupRef.current?.showModal({
      title,
      type,
      groupInfo: row,
      subTitle: '',
    });
  };

  const shoModelModal = (type: string, row = {}) => {
    const title = t(type === 'add' ? 'Model.addModel' : 'Model.editModel');
    modelRef.current?.showModal({
      title,
      type,
      modelForm: row,
      subTitle: '',
    });
  };

  const updateGroupList = () => {
    getModelGroup();
  };

  const updateModelList = () => {
    getModelGroup();
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    getModelGroup();
  };

  const onTxtClear = () => {
    getModelGroup();
  };

  const linkToDetial = (model: ModelItem) => {
    const params = new URLSearchParams({
      model_id: model.model_id,
      model_name: model.model_name,
      icn: model.icn,
      classification_id: model.classification_id,
      is_pre: model.is_pre,
    }).toString();
    router.push(`/assetManage/detail?${params}`);
  };

  const handleDragStart = (item: any) => {
    if (item) return;
    setDragItem(item);
  };

  const handleDragEnter = (item: any) => {
    if (item) return;
    setDragOverItem(item);
  };

  const handleDragEnd = (groupIndex: number) => {
    if (groupIndex) return;
    if (dragItem === null || dragOverItem === null) {
      return;
    }
    const newModelGroup = Array.from(modelGroup);
    const newItems = newModelGroup[groupIndex].list;
    const [draggedItem] = newItems.splice(dragItem.index, 1);
    newItems.splice(dragOverItem.index, 0, draggedItem);
    setDragItem(null);
    setDragOverItem(null);
    setModelGroup(newModelGroup);
  };

  const getModelGroup = () => {
    const getCroupList = get('/api/classification/');
    const getModelList = get('/api/model/');
    setLoading(true);
    try {
      Promise.all([getModelList, getCroupList])
        .then((res) => {
          const modeldata: ModelItem[] = res[0];
          const groupData: GroupItem[] = res[1];
          const groups = deepClone(groupData).map((item: GroupItem) => ({
            ...item,
            list: [],
            count: 0,
          }));
          modeldata.forEach((modelItem: ModelItem) => {
            const target = groups.find(
              (item: GroupItem) =>
                item.classification_id === modelItem.classification_id
            );
            if (target) {
              target.list.push(modelItem);
              target.count++;
            }
          });
          setGroupList(groupData);
          setModelList(modeldata);
          setModelGroup(groups);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Introduction title={t('Model.title')} message={t('Model.message')} />
      <div className={assetManageStyle.modelSetting}>
        <div className="nav-box flex justify-between mb-[10px]">
          <div className="left-side w-[240px]">
            <Input
              placeholder={t('search')}
              value={searchText}
              allowClear
              onChange={onSearchTxtChange}
              onPressEnter={onTxtPressEnter}
              onClear={onTxtClear}
            />
          </div>
          <div className="right-side">
            <Button
              type="primary"
              className="mr-[8px]"
              onClick={() => shoModelModal('add')}
            >
              {t('Model.addModel')}
            </Button>
            <Button onClick={() => showGroupModal('add')}>
              {t('Model.addGroup')}
            </Button>
          </div>
        </div>
        <Spin spinning={loading}>
          {modelGroup.length ? (
            modelGroup.map((item, groupIndex) => {
              return (
                <div className="model-group" key={item.classification_id}>
                  <div
                    className={`${assetManageStyle.groupTitle} flex items-center mt-[20px] text-[14px]`}
                  >
                    <span className="border-l-[4px] border-[var(--color-primary)] px-[4px] py-[1px] font-[600]">
                      {item.classification_name}（{item.count}）
                    </span>
                    <div className={assetManageStyle.groupOperate}>
                      <EditTwoTone
                        className="edit mr-[6px] cursor-pointer"
                        onClick={() => showGroupModal('edit', item)}
                      />
                      <DeleteTwoTone
                        className="delete cursor-pointer"
                        onClick={() => showDeleteConfirm(item)}
                      />
                    </div>
                  </div>
                  <ul className={assetManageStyle.modelList}>
                    {item.list.map((model, index) => (
                      <li
                        className={`bg-[var(--color-bg)] flex justify-between items-center ${
                          assetManageStyle.modelListItem
                        } ${
                          dragOverItem?.model_id === model.model_id &&
                          dragOverItem?.model_id !== dragItem?.model_id &&
                          modelGroup[groupIndex].list.find(
                            (group) => group.model_id === dragItem.model_id
                          )
                            ? assetManageStyle.dragActive
                            : ''
                        }`}
                        key={index}
                        draggable
                        onDragStart={() =>
                          handleDragStart({
                            ...model,
                            index,
                          })
                        }
                        onDragEnter={() =>
                          handleDragEnter({
                            ...model,
                            index,
                          })
                        }
                        onDragEnd={() => handleDragEnd(groupIndex)}
                      >
                        <div
                          className={assetManageStyle.leftSide}
                          onClick={() =>
                            linkToDetial({
                              ...model,
                              classification_id: item.classification_id,
                            })
                          }
                        >
                          <HolderOutlined
                            className={`${assetManageStyle.dragHander} cursor-move`}
                          />
                          <Image
                            src={getIconUrl(model)}
                            className="block w-auto h-10"
                            alt={t('picture')}
                            width={100}
                            height={40}
                          />
                          <div className="flex flex-col pl-[10px]">
                            <span className="text-[14px] pb-[4px] font-[600]">
                              {model.model_name}
                            </span>
                            <span className="text-[12px] text-[var(--color-text-3)]">
                              {model.model_id}
                            </span>
                          </div>
                        </div>
                        <div className={assetManageStyle.rightSide}>
                          <SwitcherOutlined />
                          <span className="text-[12px] pt-[4px]">0</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </div>
      <GroupModal ref={groupRef} onSuccess={updateGroupList} />
      <ModelModal
        ref={modelRef}
        groupList={groupList}
        onSuccess={updateModelList}
      />
    </div>
  );
};

export default AssetManage;
