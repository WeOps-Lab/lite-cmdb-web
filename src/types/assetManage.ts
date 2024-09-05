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
