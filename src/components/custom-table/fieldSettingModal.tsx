import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Checkbox, Button } from 'antd';
import OperateModal from '@/components/operate-modal';
import { useTranslation } from '@/utils/i18n';
import type { CheckboxProps } from 'antd';
import fieldSettingModalStyle from './fieldSettingModal.module.less';
import { HolderOutlined, CloseOutlined } from '@ant-design/icons';
import { deepClone } from '@/utils/common';

interface ColumnItem {
  title: string;
  key: string;
  [key: string]: unknown;
}

interface DragItem {
  index: number;
  [key: string]: unknown;
}

interface FieldModalProps {
  onConfirm: (fieldKeys: string[]) => void;
  choosableFields: ColumnItem[];
  displayFieldKeys: string[];
}

export interface FieldModalRef {
  showModal: (info: { title?: string }) => void;
}

const FieldSettingModal = forwardRef<FieldModalRef, FieldModalProps>(
  ({ onConfirm, choosableFields, displayFieldKeys }, ref) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [checkedFields, setCheckedFields] = useState<string[]>(
      choosableFields.map((field) => field.key)
    );
    const [dragFields, setDragFields] = useState(choosableFields);
    const checkAll = choosableFields.length === checkedFields.length;
    const indeterminate =
      checkedFields.length > 0 && checkedFields.length < choosableFields.length;
    const [dragItem, setDragItem] = useState<DragItem | null>(null);
    const [dragOverItem, setDragOverItem] = useState<DragItem | null>(null);

    useImperativeHandle(ref, () => ({
      showModal: ({ title }) => {
        // 开启弹窗的交互
        setTitle(title || t('fieldSetting'));
        handleCheckboxChange(displayFieldKeys);
        setVisible(true);
      },
    }));

    // 全选或取消全选
    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
      setCheckedFields(
        e.target.checked ? choosableFields.map((item) => item.key) : []
      );
      setDragFields(e.target.checked ? choosableFields : []);
    };

    // 单选
    const handleCheckboxChange = (checkedValues: string[]) => {
      setCheckedFields(checkedValues);
      setDragFields(
        choosableFields.filter((item: ColumnItem) =>
          checkedValues.includes(item.key)
        )
      );
    };

    // 清空某项
    const clearCheckedItem = (key: string) => {
      const fields = deepClone(dragFields);
      const targetIndex = fields.findIndex(
        (item: ColumnItem) => item.key === key
      );
      if (targetIndex !== -1) {
        fields.splice(targetIndex, 1);
        setDragFields(fields);
        setCheckedFields(fields.map((item: ColumnItem) => item.key));
      }
    };

    // 清空所有
    const handleClear = () => {
      setCheckedFields([]);
    };

    const handleSubmit = () => {
      onConfirm(dragFields.map((item) => item.key));
      handleCancel();
    };

    const handleCancel = () => {
      setVisible(false);
    };

    const handleDragStart = (item: DragItem) => {
      if (!item) return;
      setDragItem(item);
    };

    const handleDragEnter = (item: DragItem) => {
      if (!item) return;
      setDragOverItem(item);
    };

    const handleDragEnd = () => {
      if (dragItem === null || dragOverItem === null) {
        return;
      }
      const newItems = Array.from(dragFields);
      const [draggedItem] = newItems.splice(dragItem.index, 1);
      newItems.splice(dragOverItem.index, 0, draggedItem);
      setDragItem(null);
      setDragOverItem(null);
      setDragFields(newItems);
    };

    return (
      <OperateModal
        visible={visible}
        title={title}
        onCancel={handleCancel}
        footer={
          <div>
            <Button
              disabled={!checkedFields.length}
              className="mr-[10px]"
              type="primary"
              onClick={handleSubmit}
            >
              {t('confirm')}
            </Button>
            <Button onClick={handleCancel}>{t('cancel')}</Button>
          </div>
        }
      >
        <div className={`${fieldSettingModalStyle.settingFields} flex`}>
          {/* 左侧选择列表 */}
          <div className="w-1/2 p-4 border-r">
            <div>
              <Checkbox
                className="mb-[20px]"
                indeterminate={indeterminate}
                onChange={onCheckAllChange}
                checked={checkAll}
              >
                {t('selectAll')}
              </Checkbox>
            </div>
            <Checkbox.Group
              value={checkedFields}
              onChange={handleCheckboxChange}
            >
              <div className="flex flex-col space-y-2">
                {choosableFields.map((field) => (
                  <Checkbox key={field.key} value={field.key}>
                    {field.title}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </div>
          {/* 右侧拖拽列表 */}
          <div className={`${fieldSettingModalStyle.rightSide} w-1/2 p-4`}>
            <div className="flex justify-between items-center">
              <span>
                {t('selected')} ({`${checkedFields.length} ${t('item')}`} )
              </span>
              <Button type="link" onClick={handleClear}>
                {t('clear')}
              </Button>
            </div>
            <div className="mt-4">
              {dragFields
                .filter((field) => checkedFields.includes(field.key))
                .map((field, index) => (
                  <div
                    className={`p-2 bg-white shadow-sm ${fieldSettingModalStyle.fieldItem}`}
                    key={index}
                    draggable
                    onDragStart={() =>
                      handleDragStart({
                        ...field,
                        index,
                      })
                    }
                    onDragEnter={() =>
                      handleDragEnter({
                        ...field,
                        index,
                      })
                    }
                    onDragEnd={handleDragEnd}
                  >
                    <HolderOutlined
                      className={`mr-[4px] ${fieldSettingModalStyle.dragTrigger}`}
                    />
                    {field.title}
                    <CloseOutlined
                      className={fieldSettingModalStyle.clearItem}
                      onClick={() => clearCheckedItem(field.key)}
                    ></CloseOutlined>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </OperateModal>
    );
  }
);
FieldSettingModal.displayName = 'fieldSettingModal';
export default FieldSettingModal;
