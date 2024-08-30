import React from "react";
import { Table, TableProps } from "antd";
import customTableStyle from "./index.module.less";

interface CustomTableProps extends Omit<TableProps, "bordered" | "size"> {
  bordered?: boolean;
  size?: "large" | "middle" | "small";
}

const CustomTable: React.FC<CustomTableProps> = ({
  // 可在此处统一设置表格某属性的默认值，如果传该属性，以传入为准
  bordered = false,
  size = "large",
  ...TableProps
}) => {
  return (
    <Table
      className={customTableStyle.customTable}
      bordered={bordered}
      size={size}
      {...TableProps}
    />
  );
};

export default CustomTable;
