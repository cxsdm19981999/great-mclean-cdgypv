import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

const TextToFlowchart = () => {
  const [textInput, setTextInput] = useState("登录 → 验证短信 → 进入主页");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [editText, setEditText] = useState("");
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // 解析文本为流程图
  const parseTextToFlowchart = () => {
    const steps = textInput.split("→").map((step) => step.trim());
    const newNodes = steps.map((step, index) => ({
      id: `node-${index}`,
      data: { label: step },
      position: { x: index * 200 + 50, y: 100 },
    }));

    const newEdges = steps.slice(0, -1).map((_, index) => ({
      id: `edge-${index}`,
      source: `node-${index}`,
      target: `node-${index + 1}`,
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  };

  // 添加节点
  const onAddNode = () => {
    const newNode = {
      id: `node-${nodes.length}`,
      data: { label: "新节点" },
      position: { x: nodes.length * 200 + 50, y: 100 },
    };
    setNodes([...nodes, newNode]);

    if (nodes.length > 0) {
      const newEdge = {
        id: `edge-${edges.length}`,
        source: nodes[nodes.length - 1].id,
        target: newNode.id,
      };
      setEdges([...edges, newEdge]);
    }
  };

  // 连接节点
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 双击编辑节点
  const onNodeDoubleClick = (event, node) => {
    setSelectedNode(node);
    setEditText(node.data.label);
  };

  // 保存编辑
  const saveEdit = () => {
    setNodes(
      nodes.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label: editText } }
          : node
      )
    );
    setSelectedNode(null);
  };

  // 导出为PNG
  const exportToPng = () => {
    const flowElement = reactFlowWrapper.current.querySelector(".react-flow");
    const width = flowElement.scrollWidth;
    const height = flowElement.scrollHeight;

    htmlToImage
      .toPng(flowElement, {
        width,
        height,
        style: {
          width: width + "px",
          height: height + "px",
          transform: "none",
        },
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "flowchart.png";
        link.href = dataUrl;
        link.click();
      });
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }} ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          onInit={setReactFlowInstance}
          fitView
        >
          <Controls />
          <Background />
          <Panel position="top-left">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                style={{ width: 300, height: 60 }}
                placeholder="输入流程文本，如：登录 → 验证短信 → 进入主页"
              />
              <button onClick={parseTextToFlowchart}>生成流程图</button>
              <button onClick={onAddNode}>添加节点</button>
              <button onClick={exportToPng}>导出PNG</button>
            </div>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>

      {/* 编辑节点文字的模态框 */}
      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: 20,
            borderRadius: 5,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          <h3>编辑节点文字</h3>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ marginBottom: 10, padding: 5, width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setSelectedNode(null)}>取消</button>
            <button onClick={saveEdit}>保存</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToFlowchart;