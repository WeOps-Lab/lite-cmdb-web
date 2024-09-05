import { BUILD_IN_MODEL } from "../constants/asset";
import { getSvgIcon } from "./utils";

export const iconList = getSvgIcon();
export function getIconUrl(tex = { bk_obj_icon: "", bk_obj_id: "" }) {
  try {
    const icon = tex.bk_obj_icon?.split("icon-")[1];

    // 查找显示的图标
    const showIcon = iconList.find((item) => item.key === icon);

    // 如果显示图标存在，直接返回相应的图标路径
    if (showIcon) {
      return require(`../../public/assets/assetModelIcon/${showIcon.url}.svg`);
    }

    // 查找内置模型和对应图标
    const isBuilt = BUILD_IN_MODEL.find((item) => item.key === tex.bk_obj_id);
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
