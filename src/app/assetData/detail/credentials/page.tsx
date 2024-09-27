"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AttrFieldType,
  UserItem,
  Organization,
  InstDetail,
} from "@/types/assetManage";
import { convertArray, getAssetColumns } from "@/utils/common";
import CustomTable from "@/components/custom-table";
import { Spin, Collapse, Button } from "antd";
import useApiClient from "@/utils/request";
import { CaretRightOutlined } from "@ant-design/icons";
import credentialsStyle from "./index.module.less";
import { useTranslation } from "@/utils/i18n";

const Credentials = () => {
  const { t } = useTranslation();
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [organizationList, setOrganizationList] = useState<Organization[]>([]);
  const [assoCredentials, setAssoCredentials] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const { get, isLoading } = useApiClient();
  const modelId: string = searchParams.get("model_id") || "";
  const instId: string = searchParams.get("inst_id") || "";

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const getInitData = () => {
    const getUserList = get("/api/user_group/user_list/");
    const getGroupList = get("/api/user_group/group_list/");
    const getAssoInstList = get(
      `/api/instance/association_instance_list/${modelId}/${instId}/`
    );
    const assoList = [
      {
        src_model_id: "host",
        model_asst_id: "mysql_connect_host",
        dst_model_id: "mysql",
        asst_id: "connect",
        inst_list: [
          {
            inst_name: "hell",
            host_id: "123",
            frequence: "10",
            system: 1,
            time_out: "2024-04-10 00:00:00",
            is_started: true,
            organization: "424c9439-bc18-42c7-b10a-706a8ecfb67e",
            _id: "2",
          },
        ],
      },
      {
        src_model_id: "host",
        model_asst_id: "host_belong_oracle",
        dst_model_id: "oracle",
        asst_id: "belong",
        inst_list: [
          {
            inst_name: "tex",
            host_id: "123",
            frequence: "10",
            system: 2,
            time_out: "2024-04-10 00:00:00",
            is_started: false,
            organization: "424c9439-bc18-42c7-b10a-706a8ecfb67e",
            _id: "1",
          },
        ],
      },
    ];
    setPageLoading(true);
    try {
      Promise.all([getUserList, getGroupList, getAssoInstList])
        .then((res) => {
          const userData: UserItem[] = res[0].users;
          const organizationData: Organization[] = convertArray(res[1]);
          setUserList(userData);
          setOrganizationList(organizationData);
          setAssoCredentials(assoList);
          Promise.all(
            assoList.map((item) =>
              getModelAttrList(item, {
                assoList,
                userData,
                organizationData,
              })
            )
          ).finally(() => {
            setPageLoading(false);
          });
        })
        .catch(() => {
          setPageLoading(false);
        });
    } catch (error) {
      setPageLoading(false);
    }
  };

  const getModelAttrList = async (item: any, config: any) => {
    const responseData = await get(`/api/model/${getAttrId(item)}/attr_list/`);
    const targetIndex = config.assoList.findIndex(
      (assoItem: any) => assoItem.model_asst_id === item.model_asst_id
    );
    const columns = getAssetColumns({
      attrList: responseData,
      userList: config.userList,
      groupList: config.organizationList,
      t,
    });
    columns[0].fixed = "left";
    if (targetIndex !== -1) {
      config.assoList[targetIndex] = {
        key: item.model_asst_id,
        label: item.model_asst_id,
        asst_id: item.asst_id,
        children: (
          <CustomTable
            pagination={false}
            dataSource={item.inst_list}
            columns={columns}
            scroll={{ x: "calc(100vw - 300px)" }}
            rowKey="_id"
          />
        ),
      };
    }
    setAssoCredentials(config.assoList);
  };

  const getAttrId = (item: any) => {
    const { dst_model_id: dstModelId, src_model_id: srcModelId } = item;
    if (modelId === dstModelId) {
      return srcModelId;
    }
    return dstModelId;
  };

  return (
    <Spin spinning={pageLoading}>
      <div className={credentialsStyle.credentials}>
        <Collapse
          bordered={false}
          activeKey={assoCredentials.map((item) => item.key)}
          expandIcon={({ isActive }) => (
            <CaretRightOutlined rotate={isActive ? 90 : 0} />
          )}
          items={assoCredentials}
        />
      </div>
    </Spin>
  );
};
export default Credentials;
