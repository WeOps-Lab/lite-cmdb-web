import { useGraphStore, useGraphInstance } from "@antv/xflow";
import { useEffect, useCallback } from "react";
import { Graph } from "@antv/x6";
import { getIconUrl } from "@/utils/common";
import { ModelItem, TopoData, NodeData } from "@/types/assetManage";

interface TopoProps {
  modelId: string;
  instId: string;
  topoData: TopoData;
  modelList: ModelItem[];
}

export const InitNode: React.FC<TopoProps> = ({
  topoData,
  modelList,
  modelId,
}) => {
  const initData = useGraphStore((state) => state.initData);
  const graph = useGraphInstance();
  const setInitData = useCallback(() => {
    if (topoData.src_result || topoData.dst_result) {
      const srcResult: any = topoData.src_result;
      const dstResult: any = topoData.dst_result;
      const srcData = transformData(srcResult, 400, 250, true); // Adjust start x for src
      const dstData = transformData(dstResult, 400, 250, false); // Adjust start x for dst
      initData({
        nodes: [...srcData.nodes, ...dstData.nodes],
        edges: [...srcData.edges, ...dstData.edges],
      });
    } else {
      initData({
        nodes: [],
        edges: [],
      });
    }
  }, [initData, topoData]);

  useEffect(() => {
    Graph.registerNode(
      "custom-rect",
      {
        inherit: "rect",
        markup: [
          {
            tagName: "rect",
            selector: "body",
          },
          {
            tagName: "line",
            selector: "divider",
          },
          {
            tagName: "image",
            selector: "image",
          },
          {
            tagName: "text",
            selector: "label1",
          },
          {
            tagName: "text",
            selector: "label2",
          },
          {
            tagName: "path",
            selector: "expandBtn",
          },
        ],
        attrs: {
          body: {
            stroke: "#e5e7eb",
            strokeWidth: 1,
            fill: "#fff",
            rx: 6,
            ry: 6,
            width: 200,
            height: 80,
          },
          image: {
            width: 40,
            height: 40,
            x: 10,
            y: 18,
          },
          divider: {
            x1: 60,
            y1: 0,
            x2: 60,
            y2: 80,
            stroke: "#e5e7eb",
            strokeWidth: 1,
          },
          label1: {
            refX: 0.4,
            refY: 0.4,
            textWrap: {
              width: 120,
              height: 20,
              ellipsis: true,
            },
            textAnchor: "center",
            textVerticalAnchor: "middle",
            fontSize: 14,
            fill: "#333",
          },
          label2: {
            refX: 0.4,
            refY: 0.7,
            textWrap: {
              width: 120,
              height: 20,
              ellipsis: true,
            },
            textAnchor: "center",
            textVerticalAnchor: "middle",
            fontSize: 14,
            fill: "#B2BDCC",
          },
          expandBtn: {
            d: "M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z",
            fill: "red",
            cursor: "pointer",
            refX: 1,
            refDx: -7,
            refY: 0.42,
            stroke: "#B2BDCC",
            strokeWidth: 1,
            event: "node:collapse",
            zIndex: 99,
          },
        },
        data: {
          expanded: true,
        },
        draggable: false,
        zIndex: 10,
      },
      true
    );
    setInitData();
    setTimeout(() => {
      graph?.getNodes().forEach((node) => {
        if (node.getData().expanded) {
          node.show();
        } else {
          node.hide();
        }
      });
    }, 0);
    graph?.on("node:collapse", handleCollapse);
    graph?.on("node:click", linkToDetail);
    return () => {
      graph?.off("node:collapse", handleCollapse);
      graph?.off("node:click", linkToDetail);
    };
  }, [setInitData]);

  const handleCollapse = ({ node }: { node: any }) => {
    const isExpanded = node.getData().expanded;
    node.setData({ expanded: !isExpanded });
    node.setAttrs({
      expandBtn: {
        d: isExpanded
          ? "M 3 6 L 9 6 M 6 3 L 6 9 M 1 1 L 11 1 L 11 11 L 1 11 Z"
          : "M 3 6 L 9 6 M 1 1 L 11 1 L 11 11 L 1 11 Z",
      },
    });
    const children = node.getData().children || [];
    const id = node.getData().modelId || "";
    if (id === modelId) {
      graph?.getNodes().forEach((item) => {
        if (item.getData().modelId !== modelId) {
          if (isExpanded) {
            item.hide();
          } else {
            item.show();
          }
        }
      });
    } else {
      children.forEach((child: NodeData) => {
        const childNode = graph?.getCellById(child._id.toString());
        if (childNode) {
          if (isExpanded) {
            childNode.hide();
          } else {
            childNode.show();
          }
        }
      });
    }
  };

  const linkToDetail = (data: any) => {
    const { e, node } = data;
    const target = e.target;
    if (
      target.tagName === "path" &&
      target.getAttribute("event") === "node:collapse"
    ) {
      return;
    }
    const row = node?.getData();
    const params: any = {
      icn: "",
      model_name: showModelName(row.modelId),
      model_id: row.modelId,
      classification_id: "",
      inst_id: node.id,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `/assetData/detail/baseInfo?${queryString}`;
    window.open(url, "_blank", "noopener,noreferrer");
    console.log(data);
  };

  const showModelName = (id: string) => {
    return modelList.find((item) => item.model_id === id)?.model_name || "--";
  };

  const transformData = (
    data: NodeData,
    x: number,
    y: number,
    isSrc: boolean
  ) => {
    const nodes: any = [];
    const edges: any = [];

    const traverse = (
      node: NodeData,
      parentId: string | null,
      level: number
    ) => {
      if (!node._id) {
        return { nodes: [], edges: [] };
      }
      const id = node._id.toString();
      const nodeX = isSrc ? x - level * 250 : x + level * 250; // Adjust x based on isSrc
      const nodeY = y + nodes.length * 100;
      const hasChild = !!node.children?.length;
      nodes.push({
        id,
        x: nodeX,
        y: nodeY,
        width: 200,
        height: 80,
        shape: "custom-rect",
        attrs: {
          image: {
            "xlink:href": getIconUrl({ icn: "", model_id: node.model_id })
              ?.default?.src,
          },
          label1: {
            text: node.inst_name,
          },
          label2: {
            text: showModelName(node.model_id),
          },
          expandBtn: {
            stroke: hasChild ? "#e5e7eb" : "",
            fill: hasChild ? "#fff" : "transparent",
          },
        },
        data: {
          expanded: level <= 3, // 设置默认展开多少级
          children: node.children,
          modelId: node.model_id,
        },
      });
      if (parentId) {
        edges.push({
          source: parentId,
          target: id,
          attrs: {
            line: {
              stroke: "#e5e7eb",
              strokeWidth: 1,
            },
          },
          label: {
            attrs: {
              text: {
                text: node.asst_id,
                fill: "#B2BDCC", // 设置label颜色
              },
            },
          },
          router: {
            name: "er",
            args: {
              direction: "H",
              offset: 50,
            },
          },
        });
      }
      (node.children || []).forEach((child) => {
        traverse(child, id, level + 1);
      });
    };
    traverse(data, null, 1);
    return { nodes, edges };
  };

  return null;
};
