"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/utils/i18n";
import { SearchOutlined } from "@ant-design/icons";
import assetSearchStyle from "./index.module.less";
import { ArrowRightOutlined } from "@ant-design/icons";
import {
  AttrFieldType,
  UserItem,
  Organization,
  ModelItem,
} from "@/types/assetManage";
import { Spin, Input, Tabs, Button } from "antd";
import useApiClient from "@/utils/request";
import { useCommon } from "@/context/common";
import { deepClone, getFieldItem } from "@/utils/common";
const { Search } = Input;
interface AssetListItem {
  model_id: string;
  _id: string;
  [key: string]: unknown;
}
interface TabItem {
  key: string;
  label: string;
  children: Array<AssetListItem>;
}

interface TabJsxItem {
  key: string;
  label: string;
  children: JSX.Element;
}

const AssetSearch = () => {
  const { t } = useTranslation();
  const { get, post, isLoading } = useApiClient();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const users = useRef(commonContext?.userList || []);
  const userList: UserItem[] = users.current;
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("");
  const [items, setItems] = useState<TabJsxItem[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(true);
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [instDetail, setInstDetail] = useState<TabJsxItem[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeInstItem, setActiveInstItem] = useState<number>(-1);
  const [instData, setInstData] = useState<TabItem[]>([]);

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  useEffect(() => {
    if (propertyList.length) {
      const tabJsx = getInstDetial(instData, propertyList);
      setItems(tabJsx);
    }
  }, [propertyList, instData, activeInstItem, activeTab]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const getInitData = async () => {
    setPageLoading(true);
    try {
      const data = await get("/api/model/");
      setModelList(data);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSearch = async () => {
    setShowSearch(!searchText);
    if (!searchText) return;
    setPageLoading(true);
    try {
      const data: AssetListItem[] = await post(
        "/api/instance/fulltext_search/",
        {
          search: searchText,
        }
      );
      const tabItems: TabItem[] = getAssetList(data);
      const defaultTab = tabItems[0]?.key || "";
      const attrList = await get(`/api/model/${defaultTab}/attr_list/`);
      setPropertyList(attrList);
      setInstData(tabItems);
      setActiveTab(defaultTab);
      setPageLoading(false);
    } catch (error) {
      setPageLoading(false);
    }
  };

  const getAssetList = (data: AssetListItem[]) => {
    const result = data.reduce((acc: any, item) => {
      const { model_id: modelId } = item;
      if (acc[modelId]) {
        acc[modelId].children.push(item);
      } else {
        acc[modelId] = { key: modelId, children: [item] };
      }
      return acc;
    }, {});
    return Object.values(result).map((item: any) => ({
      ...item,
      label: getModelName(item),
    }));
  };

  const getInstDetial = (tabItems: TabItem[], properties: AttrFieldType[]) => {
    const lists = deepClone(tabItems);
    lists.forEach((item: any) => {
      const descItems = item.children.map((desc: AssetListItem) => {
        const arr = Object.entries(desc)
          .map(([key, value]) => {
            return {
              key: key,
              label: properties.find((item) => item.attr_id === key)?.attr_name,
              children: value,
              id: desc._id,
            };
          })
          .filter((desc) => !!desc.label);
        return arr;
      });
      if (item.key === activeTab) {
        setInstDetail(descItems[0] || []);
        if (activeInstItem < 0) {
          setActiveInstItem(0);
        }
      }
      item.children = (
        <div className={assetSearchStyle.searchResult}>
          <div className={assetSearchStyle.list}>
            {descItems.map((target: TabJsxItem[], index: number) => (
              <div
                key={index}
                className={`${assetSearchStyle.listItem} ${
                  index === activeInstItem ? assetSearchStyle.active : ""
                }`}
                onClick={() => checkInstDetail(index, target)}
              >
                <div className={`${assetSearchStyle.title} mb-[10px]`}>{`${
                  item.key
                } - ${
                  target.find((title: TabJsxItem) => title.key === "inst_name")
                    ?.children || "--"
                }`}</div>
                <ul>
                  {target.map((list: TabJsxItem) => {
                    const fieldItem: any =
                      propertyList.find(
                        (property) => property.attr_id === list.key
                      ) || {};
                    const fieldVal: string =
                      getFieldItem({
                        fieldItem,
                        userList,
                        groupList: organizationList,
                        isEdit: false,
                        value: list.children,
                        hideUserAvatar: true,
                      }).toString() || "--";
                    return fieldVal.includes(searchText) ||
                        ["inst_name", "organization"].includes(list.key) ? (
                        <li key={list.key}>
                          <span>{list.label}</span>:
                          <span
                            className={
                              fieldVal.includes(searchText)
                                ? "text-[var(--color-primary)]"
                                : ""
                            }
                          >
                            {fieldVal}
                          </span>
                        </li>
                      ) : null;
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className={assetSearchStyle.detail}>
            <div className={assetSearchStyle.detailTile}>
              <div className={assetSearchStyle.title}>{`${item.key} - ${
                instDetail.find(
                  (title: TabJsxItem) => title.key === "inst_name"
                )?.children || "--"
              }`}</div>
              <Button
                type="link"
                iconPosition="end"
                icon={<ArrowRightOutlined />}
                onClick={linkToDetail}
              >
                {t("seeMore")}
              </Button>
            </div>
            <ul>
              {instDetail.map((list: TabJsxItem) => {
                const fieldItem: any =
                  propertyList.find(
                    (property) => property.attr_id === list.key
                  ) || {};
                const fieldVal: string =
                  getFieldItem({
                    fieldItem,
                    userList,
                    groupList: organizationList,
                    isEdit: false,
                    value: list.children,
                    hideUserAvatar: true,
                  }).toString() || "--";
                return (
                  <li
                    key={list.key}
                    className={assetSearchStyle.detailListItem}
                  >
                    <span className={assetSearchStyle.listItemLabel}>
                      <span
                        className={assetSearchStyle.label}
                        title={list.label}
                      >
                        {list.label}
                      </span>
                      <span className={assetSearchStyle.labelColon}>:</span>
                    </span>
                    <span
                      title={fieldVal}
                      className={`${
                        fieldVal.includes(searchText)
                          ? "text-[var(--color-primary)]"
                          : ""
                      } ${assetSearchStyle.listItemValue}`}
                    >
                      {fieldVal}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      );
    });
    return lists;
  };

  const getModelName = (item: TabItem) => {
    return (
      (modelList.find((model) => model.model_id === item.key)?.model_name ||
        "--") + `(${item.children.length})`
    );
  };

  const linkToDetail = () => {
    const _instDetail = deepClone(instDetail);
    const params: any = {
      icn: "",
      model_name:
        modelList.find((model) => model.model_id === activeTab)?.model_name ||
        "--",
      model_id: activeTab,
      classification_id: "",
      inst_id: _instDetail[0]?.id || "",
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `/assetData/detail/baseInfo?${queryString}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const onTabChange = async (key: string) => {
    setActiveTab(key);
    setPageLoading(true);
    try {
      const attrList = await get(`/api/model/${key}/attr_list/`);
      setPropertyList(attrList);
      setActiveInstItem(-1);
    } finally {
      setPageLoading(false);
    }
  };

  const checkInstDetail = (index: number, row: TabJsxItem[]) => {
    setActiveInstItem(index);
    setInstDetail(row);
  };

  return (
    <div className={assetSearchStyle.assetSearch}>
      <Spin spinning={pageLoading}>
        {showSearch ? (
          <div className={assetSearchStyle.searchInput}>
            <Search
              className="mt-[15%] w-[70%]"
              value={searchText}
              allowClear
              size="large"
              placeholder={t("Model.assetSearchTxt")}
              enterButton={
                <div
                  className={assetSearchStyle.searchBtn}
                  onClick={handleSearch}
                >
                  <SearchOutlined className="pr-[8px]" />
                  {t("searchTxt")}
                </div>
              }
              onChange={handleTextChange}
              onPressEnter={handleSearch}
            />
          </div>
        ) : (
          <div className={assetSearchStyle.searchDetail}>
            <Search
              className="w-[500px]"
              value={searchText}
              allowClear
              placeholder={t("Model.assetSearchTxt")}
              enterButton={
                <div
                  className={assetSearchStyle.searchBtn}
                  onClick={handleSearch}
                >
                  <SearchOutlined className="pr-[8px]" />
                  {t("searchTxt")}
                </div>
              }
              onChange={handleTextChange}
              onPressEnter={handleSearch}
            />
            <div>
              <Tabs
                activeKey={activeTab}
                items={items}
                onChange={onTabChange}
              />
            </div>
          </div>
        )}
      </Spin>
    </div>
  );
};
export default AssetSearch;
