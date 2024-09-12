import React, { useRef } from "react";
import { Table, TableProps } from "antd";
import { SettingFilled } from "@ant-design/icons";
import customTableStyle from "./index.module.less";
import FieldSettingModal from "./fieldSettingModal";

interface ColumnItem {
  title: string;
  key: string;
  [key: string]: unknown;
}
interface CustomTableProps
  extends Omit<TableProps, "bordered" | "size" | "showSetting"> {
  bordered?: boolean;
  size?: "large" | "middle" | "small";
  fieldSetting?: {
    showSetting: boolean;
    displayFieldKeys: string[];
    choosableFields: ColumnItem[];
  };
  onSelectFields?: (fields: string[]) => void;
}

interface FieldRef {
  showModal: (config: { title?: string }) => void;
}

const CustomTable: React.FC<CustomTableProps> = ({
  // 可在此处统一设置表格某属性的默认值，如果传该属性，以传入为准
  bordered = false,
  size = "large",
  fieldSetting = {
    showSetting: false,
    displayFieldKeys: [],
    choosableField: [],
  },
  onSelectFields = () => [],
  ...TableProps
}) => {
  const fieldRef = useRef<FieldRef>(null);
  const showFeildSetting = () => {
    fieldRef.current?.showModal({});
  };

  return (
    <div className={customTableStyle.customTable}>
      <Table bordered={bordered} size={size} {...TableProps}></Table>
      {fieldSetting.showSetting ? (
        <SettingFilled
          className={customTableStyle.setting}
          onClick={showFeildSetting}
        />
      ) : null}
      <FieldSettingModal
        ref={fieldRef}
        choosableFields={fieldSetting.choosableFields || []}
        displayFieldKeys={fieldSetting.displayFieldKeys}
        onConfirm={onSelectFields}
      />
    </div>
  );
};

export default CustomTable;
