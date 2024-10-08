"use client";

import { createContext, useContext, useEffect, useState } from "react";
import useApiClient from "@/utils/request";

interface CommonContextType {
  permissionGroupsInfo: PermissionGroupsInfo;
}

interface PermissionGroupsInfo {
  is_all: boolean;
  group_ids: string[];
}

const CommonContext = createContext<CommonContextType | null>(null);

const CommonContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [permissionGroupsInfo, setPermissionGroupsInfo] =
    useState<PermissionGroupsInfo>({
      is_all: true,
      group_ids: [],
    });
  const [pageLoading, setPageLoading] = useState(false);
  const { get } = useApiClient();

  useEffect(() => {
    getPermissionGroups();
  }, []);

  const getPermissionGroups = async () => {
    setPageLoading(true);
    try {
      const res = await get("/api/user_group/user_groups/");
      setPermissionGroupsInfo(res);
    } finally {
      setPageLoading(false);
    }
  };
  return pageLoading ? null : (
    <CommonContext.Provider value={{ permissionGroupsInfo }}>
      {children}
    </CommonContext.Provider>
  );
};

export const useCommon = () => useContext(CommonContext);

export default CommonContextProvider;
