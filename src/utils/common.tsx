import { BUILD_IN_MODEL } from "@/constants/asset";
import { getSvgIcon } from "./utils";
import { AttrFieldType } from "@/types/assetManage";
import { Tag, Select, Input, Cascader, DatePicker } from "antd";
import {
  ModelIconItem,
  ColumnItem,
  UserItem,
  SubGroupItem,
  Organization,
  OriginOrganization,
  OriginSubGroupItem,
  EnumList,
} from "@/types/assetManage";
const { RangePicker } = DatePicker;

export const iconList = getSvgIcon();
export function getIconUrl(tex: ModelIconItem) {
  try {
    const icon = tex.icn?.split("icon-")[1];

    // 查找显示的图标
    const showIcon = iconList.find((item) => item.key === icon);

    // 如果显示图标存在，直接返回相应的图标路径
    if (showIcon) {
      return require(`../../public/assets/assetModelIcon/${showIcon.url}.svg`);
    }

    // 查找内置模型和对应图标
    const isBuilt = BUILD_IN_MODEL.find((item) => item.key === tex.model_id);
    const builtIcon = isBuilt
      ? iconList.find((item) => item.key === isBuilt.icon)
      : null;

    // 使用内置模型图标或者默认图标
    const iconUrl = builtIcon?.url || "cc-default_默认";

    // 返回图标路径
    return require(`../../public/assets/assetModelIcon/${iconUrl}.svg`);
  } catch (e) {
    // 记录错误日志并返回默认图标
    console.error("Error in getIconUrl:", e);
    return require("../../public/assets/assetModelIcon/cc-default_默认.svg");
  }
}

// 深克隆
export const deepClone = (obj: any, hash = new WeakMap()) => {
  if (Object(obj) !== obj) return obj;
  if (obj instanceof Set) return new Set(obj);
  if (hash.has(obj)) return hash.get(obj);

  const result =
    obj instanceof Date
      ? new Date(obj)
      : obj instanceof RegExp
        ? new RegExp(obj.source, obj.flags)
        : obj.constructor
          ? new obj.constructor()
          : Object.create(null);

  hash.set(obj, result);

  if (obj instanceof Map) {
    Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash)));
  }

  // 复制函数
  if (typeof obj === "function") {
    return function (this: unknown, ...args: unknown[]): unknown {
      return obj.apply(this, args);
    };
  }

  // 递归复制对象的其他属性
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // File不做处理
      if (obj[key] instanceof File) {
        result[key] = obj[key];
        continue;
      }
      result[key] = deepClone(obj[key], hash);
    }
  }

  return result;
};

export const getRandomColor = () => {
  const colors = ["#875CFF", "#FF9214", "#00CBA6", "#1272FF"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

// 根据分组id找出分组名称
export const findGroupNameById = (arr: Array<SubGroupItem>, value: unknown) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].value === value) {
      return arr[i].label;
    }
    if (arr[i].children && arr[i].children?.length) {
      const label: unknown = findGroupNameById(arr[i]?.children || [], value);
      if (label) {
        return label;
      }
    }
  }
  return null;
};

// 根据数组id找出对应名称（多选）
export const findNameByIds = (list: Array<any>, ids: Array<string>) => {
  const map = new Map(list.map((i) => [i.id, i.name]));
  return ids.map((id) => map.get(id)).join("，") || "--";
};

// 组织改造成联级数据
export const convertArray = (
  arr: Array<OriginOrganization | OriginSubGroupItem>
) => {
  const result: any = [];
  arr.forEach((item) => {
    const newItem = {
      value: item.id,
      label: item.name,
      children: [],
    };
    const subGroups: OriginSubGroupItem[] = item.subGroups;
    if (subGroups && !!subGroups.length) {
      newItem.children = convertArray(subGroups);
    }
    result.push(newItem);
  });
  return result;
};

export const getAssetColumns = (config: {
  attrList: AttrFieldType[];
  userList?: UserItem[];
  groupList?: Organization[];
  t?: any;
}): ColumnItem[] => {
  return config.attrList.map((item: AttrFieldType) => {
    const attrType = item.attr_type;
    const attrName = item.attr_name;
    const attrId = item.attr_id;
    const columnItem: ColumnItem = {
      title: attrName,
      dataIndex: attrId,
      key: attrId,
    };
    switch (attrType) {
      case "user":
        return {
          ...columnItem,
          render: (_: unknown, record: any) => {
            const userName =
              (config.userList || []).find((item) => item.id === record[attrId])
                ?.username || "--";
            return (
              <div className="column-user">
                <span
                  className="user-avatar"
                  style={{ background: getRandomColor() }}
                >
                  {userName.slice(0, 1).toLocaleUpperCase()}
                </span>
                {userName}
              </div>
            );
          },
        };
      case "pwd":
        return {
          ...columnItem,
          render: () => <>***</>,
        };
      case "organization":
        return {
          ...columnItem,
          render: (_: unknown, record: any) => (
            <>
              {findGroupNameById(config.groupList || [], record[attrId][0]) ||
                "--"}
            </>
          ),
        };
      case "bool":
        return {
          ...columnItem,
          render: (_: unknown, record: any) => (
            <>
              <Tag color={record[attrId] ? "green" : "geekblue"}>
                {config.t(record[attrId] ? "yes" : "no")}
              </Tag>
            </>
          ),
        };
      case "enum":
        return {
          ...columnItem,
          render: (_: unknown, record: any) => (
            <>
              {item.option?.find((item: EnumList) => item.id === record[attrId])
                ?.name || "--"}
            </>
          ),
        };
      default:
        return {
          ...columnItem,
          render: (_: unknown, record: any) => <>{record[attrId] || "--"}</>,
        };
    }
  });
};

export const getFieldItem = (config: {
  fieldItem: AttrFieldType;
  userList?: UserItem[];
  groupList?: Organization[];
  isEdit: boolean;
  value?: any;
}) => {
  if (config.isEdit) {
    switch (config.fieldItem.attr_type) {
      case "user":
        return (
          <Select>
            {config.userList?.map((opt: UserItem) => (
              <Select.Option key={opt.id} value={opt.id}>
                {opt.username}
              </Select.Option>
            ))}
          </Select>
        );
      case "enum":
        return (
          <Select>
            {config.fieldItem.option?.map((opt) => (
              <Select.Option key={opt.id} value={opt.id}>
                {opt.name}
              </Select.Option>
            ))}
          </Select>
        );
      case "bool":
        return (
          <Select>
            {[
              { id: 1, name: "Yes" },
              { id: 0, name: "No" },
            ].map((opt) => (
              <Select.Option key={opt.id} value={opt.id}>
                {opt.name}
              </Select.Option>
            ))}
          </Select>
        );
      case "organization":
        return <Cascader options={config.groupList} />;
      case "time":
        return (
          <RangePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
          />
        );
      default:
        return <Input />;
    }
  }
  switch (config.fieldItem.attr_type) {
    case "user":
      return (
        (config.userList || []).find((item) => item.id === config.value)
          ?.username || "--"
      );
    case "organization":
      return findGroupNameById(config.groupList || [], config.value[0]) || "--";
    case "bool":
      return config.value ? "Yes" : "No";
    case "enum":
      return (
        config.fieldItem.option?.find(
          (item: EnumList) => item.id === config.value
        )?.name || "--"
      );
    default:
      return config.value || "--";
  }
};
