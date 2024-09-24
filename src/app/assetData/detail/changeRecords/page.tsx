"use client";

import React, { useState, useEffect, useRef } from "react";
import { DatePicker, Timeline, Spin } from "antd";
import changeRecordsStyle from "./index.module.less";
import useApiClient from "@/utils/request";
import RecordDetail from "./recordDetail";
import { useTranslation } from "@/utils/i18n";
import { useSearchParams } from "next/navigation";
import {
  AttrFieldType,
  ModelItem,
  Organization,
  UserItem,
  AssoTypeItem,
} from "@/types/assetManage";

const { RangePicker } = DatePicker;

interface RecordsEnum {
  [key: string]: string;
}

interface RecordItemList {
  type: string;
  created_at: string;
  operator: string;
  id: number;
  [key: string]: unknown;
}

interface RecordItem {
  date: string;
  list: RecordItemList[];
}

interface detailRef {
  showModal: (config: {
    subTitle: string;
    title: string;
    recordRow: any;
  }) => void;
}

const ChangeRecords: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [enumList, setEnumList] = useState<RecordsEnum>({});
  const [recordList, setRecordList] = useState<RecordItem[]>([]);
  const [attrList, setAttrList] = useState<AttrFieldType[]>([]);
  const { get, isLoading } = useApiClient();
  const [modelList, setModelList] = useState<ModelItem[]>([]);
  const [assoTypes, setAssoTypes] = useState<AssoTypeItem[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const detailRef = useRef<detailRef>(null);
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const modelId: string = searchParams.get("model_id") || "";

  useEffect(() => {
    if (isLoading) return;
    // 初始加载数据
    initData();
  }, [get, isLoading]);

  const showDetailModal = (log: RecordItemList) => {
    detailRef.current?.showModal({
      title: enumList[log.type] + showModelName(log.model_id),
      subTitle: "",
      recordRow: log,
    });
  };

  const showModelName = (id: unknown) => {
    return modelList.find((item) => item.model_id === id)?.model_name || "--";
  };

  const initData = async (dates = null) => {
    const getChangeRecordLists = get("/api/change_record/");
    const getEnumData = get("/api/change_record/enum_data/");
    const getAttrList = get(`/api/model/${modelId}/attr_list/`);
    const getModelList = get("/api/model/");
    const getGroupList = get("/api/user_group/group_list/");
    const getUserList = get("/api/user_group/user_list/");
    const getAssoType = get("/api/model/model_association_type/");
    try {
      setLoading(true);
      Promise.all([
        getChangeRecordLists,
        getEnumData,
        getAttrList,
        getModelList,
        getGroupList,
        getUserList,
        getAssoType,
      ])
        .then((res) => {
          const enumData = res[1];
          setEnumList(enumData);
          dealRecordList(res[0]);
          setAttrList(res[2] || []);
          setModelList(res[3] || []);
          setOrganizationList(res[4] || []);
          setUserList(res[5] || []);
          setAssoTypes(res[6] || []);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      setLoading(false);
    }
  };

  const dealRecordList = (data: RecordItemList[]) => {
    const recordData = data
      .map((item: RecordItemList) => ({
        ...item,
        created_at: new Date(item.created_at),
      }))
      .reduce((acc: any, item: any) => {
        const yearMonth = item.created_at.toISOString().slice(0, 7); // 获取年-月
        if (!acc[yearMonth]) {
          acc[yearMonth] = [];
        }
        acc[yearMonth].push(item);
        return acc;
      }, {});
    const records = Object.keys(recordData)
      .map((key) => ({
        date: key,
        list: recordData[key]
          .map((item: any) => ({
            ...item,
            type: item.type,
            created_at: item.created_at.toISOString(),
            operator: item.operator,
          }))
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          ), // 按内部列表时间倒序排序
      }))
      .sort(
        (a: any, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ); // 按外部列表时间倒序排序
    setRecordList(records);
  };

  const handleDateChange = async (dateString: any = []) => {
    const params = {
      created_at_after: "",
      created_at_before: "",
    };
    params.created_at_after = dateString[0] || "";
    params.created_at_before = dateString[1] || "";
    setLoading(true);
    try {
      const data = await get("/api/change_record/", {
        params,
      });
      dealRecordList(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={changeRecordsStyle.changeRecords}>
        <div className="flex justify-between items-center mb-4">
          <RangePicker
            className="w-[400px]"
            showTime
            onChange={(value, dateString) => handleDateChange(dateString)}
          />
        </div>
        <div
          className={`bg-[var(--color-fill-2)] rounded-lg px-[20px] py-[10px] ${changeRecordsStyle.list}`}
        >
          {recordList.map((event, index) => (
            <div key={index}>
              <h4 className="text-[15px] font-semibold mb-[10px]">
                {event.date}
              </h4>
              <Timeline>
                {event.list.map((log, logIndex) => (
                  <Timeline.Item key={logIndex}>
                    <div
                      onClick={() => showDetailModal(log)}
                      className="cursor-pointer"
                    >
                      <div className="mb-[4px]">
                        {enumList[log.type] + showModelName(log.model_id)}
                      </div>
                      <div className="flex items-center text-[12px]">
                        <span className="text-[var(--color-text-3)]">
                          {log.created_at}
                        </span>
                        <span
                          className={`${changeRecordsStyle.operator} text-[var(--color-text-3)]`}
                        >
                          {t("Model.operator")}: {log.operator}
                        </span>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          ))}
        </div>
      </div>
      <RecordDetail
        ref={detailRef}
        userList={userList}
        propertyList={attrList}
        modelList={modelList}
        groupList={organizationList}
        enumList={enumList}
        connectTypeList={assoTypes}
      />
    </Spin>
  );
};

export default ChangeRecords;