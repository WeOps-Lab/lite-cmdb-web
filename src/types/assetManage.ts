export interface GroupItem {
  classification_name: string;
  classification_id: string;
  count: number;
  list: ModelItem[];
  [key: string]: any;
}

export interface ModelItem {
  model_id: string;
  classification_id: string;
  model_name: string;
  icn: string;
  [key: string]: any;
}

export interface GroupFieldType {
  classification_id?: string;
  classification_name?: string;
  _id?: string | number;
}

export interface GroupConfig {
  type: string;
  groupInfo: GroupFieldType;
  subTitle: string;
  title: string;
}

export interface ModelConfig {
  type: string;
  modelForm: any;
  subTitle: string;
  title: string;
}

export interface ClassificationItem {
  classification_name: string;
  classification_id: string;
  [key: string]: any;
}

export interface AssoTypeItem {
  asst_id: string;
  asst_name: string;
  [key: string]: any;
}

export interface AssoFieldType {
  asst_id: string;
  src_model_id: string;
  dst_model_id: string;
  mapping: string;
}

export interface AttrFieldType {
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

export interface ModelIconItem {
  icn: string | undefined;
  model_id: string | undefined;
  [key: string]: unknown;
}
export interface ColumnItem {
  title: string;
  dataIndex: string;
  key: string;
  render?: (_: unknown, record: any) => JSX.Element;
  [key: string]: any;
}
export interface UserItem {
  id: string;
  username: string;
  [key: string]: unknown;
}
export interface SubGroupItem {
  value?: string;
  label?: string;
  children?: Array<SubGroupItem>;
}
export interface Organization {
  id: string;
  name: string;
  children: Array<SubGroupItem>;
  [key: string]: unknown;
}

export interface OriginSubGroupItem {
  id: string;
  name: string;
  parentId: string;
  subGroupCount: number;
  subGroups: Array<OriginSubGroupItem>;
}
export interface OriginOrganization {
  id: string;
  name: string;
  subGroupCount: number;
  subGroups: Array<OriginSubGroupItem>;
  [key: string]: unknown;
}

export interface AssetDataFieldProps {
  propertyList: AttrFieldType[];
  userList: UserItem[];
  organizationList: Organization[];
  instDetail: InstDetail;
  onsuccessEdit: () => void;
}

export interface InstDetail {
  inst_name?: string;
  organization?: string;
  [key: string]: unknown;
}
