import React, { useState, useEffect } from "react";
import { XFlow, XFlowGraph, Grid, Snapline } from "@antv/xflow";
import { ModelItem, AssoTypeItem, TopoData } from "@/types/assetManage";
import { useTranslation } from "@/utils/i18n";
import useApiClient from "@/utils/request";
import { InitNode } from "./topoData";
import { Spin } from "antd";

interface AssoTopoProps {
  modelList: ModelItem[];
  assoTypeList: AssoTypeItem[];
  modelId: string;
  instId: string;
}

const Topo: React.FC<AssoTopoProps> = ({
  assoTypeList,
  modelList,
  modelId,
  instId,
}) => {
  const { t } = useTranslation();
  const { get, isLoading } = useApiClient();
  const [topoData, setTopoData] = useState<TopoData>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) return;
    getTopoList();
  }, [modelId, instId, isLoading]);

  const getTopoList = async () => {
    setLoading(true);
    try {
      const data = await get(`/api/instance/topo_search/${modelId}/${instId}/`);
      setTopoData(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ height: "calc(100vh - 200px)" }} id="container">
        <XFlow>
          <XFlowGraph zoomable pannable minScale={0.05} maxScale={10} fitView />
          <Grid type="dot" options={{ color: "#ccc", thickness: 1 }} />
          <Snapline sharp />
          <InitNode
            modelId={modelId}
            instId={instId}
            topoData={topoData}
            modelList={modelList}
          />
        </XFlow>
      </div>
    </Spin>
  );
};

export default Topo;
