"use client";

import { createContext, useContext, useEffect, useState } from "react";
import useApiClient from "@/utils/request";
import { UserItem, Organization } from "@/types/assetManage";
import { convertArray, filterNodesWithAllParents } from "@/utils/common";

interface CommonContextType {
  permissionGroupsInfo: PermissionGroupsInfo;
  userList: UserItem[];
  authOrganizations: Organization[];
  organizations: Organization[];
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
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [authOrganizations, setAuthOrganizations] = useState<Organization[]>(
    []
  );
  const [pageLoading, setPageLoading] = useState(false);
  const { get } = useApiClient();

  useEffect(() => {
    getPermissionGroups();
  }, []);

  const getPermissionGroups = async () => {
    setPageLoading(true);
    try {
      const getUserList = get("/api/user_group/user_list/");
      const getOrganizationList = get("/api/user_group/group_list/");
      const getAuthOrganization = get("/api/user_group/user_groups/");
      Promise.all([getUserList, getOrganizationList, getAuthOrganization])
        .then((res) => {
          const userData: UserItem[] = res[0].users;
          const allOrganizations = res[1];
          const authOrganizationData: PermissionGroupsInfo = res[2];
          const groupIds = authOrganizationData.group_ids || [];
          const isAdmin = !!authOrganizationData.is_all || false;
          const authOrganizations = filterNodesWithAllParents(
            allOrganizations,
            groupIds
          );
          const authList: Organization[] = convertArray(
            isAdmin ? allOrganizations : authOrganizations
          );
          setPermissionGroupsInfo(authOrganizationData);
          setUserList(userData);
          setAuthOrganizations(authList);
          setOrganizations(convertArray(allOrganizations));
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch {
      setPageLoading(false);
    }
  };
  return pageLoading ? null : (
    <CommonContext.Provider
      value={{
        permissionGroupsInfo,
        userList,
        authOrganizations,
        organizations,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

export const useCommon = () => useContext(CommonContext);

export default CommonContextProvider;
