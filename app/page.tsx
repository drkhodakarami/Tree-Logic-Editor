"use client"

import React, { useCallback, useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  useReactFlow,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type EdgeTypes,
  ConnectionLineType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FaQuestion,
  FaListUl,
  FaTimes,
  FaQuestionCircle,
  FaBolt,
  FaSitemap,
  FaPlay,
  FaCogs,
  FaMap,
  FaRandom,
  FaDiceFive,
  FaClipboardList,
  FaWaveSquare,
  FaCamera,
  FaSync,
  FaCheckCircle,
  FaFire,
  FaKey,
  FaBullhorn,
  FaBinoculars,
  FaLock,
} from "react-icons/fa";
import { toPng } from "html-to-image";
import { FaWandMagicSparkles } from "react-icons/fa6";

// ------ Global Constants: icons, BTType, meta, nodeTypes ------
const icons = {
  start: FaPlay,
  selector: FaQuestion,
  sequence: FaListUl,
  condition: FaQuestionCircle,
  hasRecipe: FaQuestionCircle,
  hasBBValue: FaBinoculars,
  subtree: FaSitemap,
  hasResource: FaSitemap,
  handleResource: FaSitemap,
  handleCraft: FaSitemap,
  action: FaCogs,
  getRecipe: FaKey,
  setRecipe: FaLock,
  logOut: FaBullhorn,
  getBBValue: FaBinoculars,
  random: FaFire,
  randomSelector: FaRandom,
  randomSequence: FaDiceFive,
  not: FaTimes,
  parallel: FaBolt,
  untilSuccess: FaCheckCircle,
  untilFailure: FaWaveSquare,
  repeat: FaSync,
} as const;
type BTType = keyof typeof icons;

const meta: Record<BTType, { label: string; color: string }> = {
  start: { label: "Start", color: "#22c55e" },
  selector: { label: "Selector", color: "#ef4444" },
  sequence: { label: "Sequence", color: "#3b82f6" },
  condition: { label: "Condition", color: "#8b5cf6" },
  hasRecipe: { label: "Has Recipe", color: "#f97316" },
  hasBBValue: { label: "Has B.B. Value", color: "#8b5cf6" },
  subtree: { label: "SubTree Node", color: "#14b8a6" },
  hasResource: { label: "Has Resource Tree", color: "#ec4899" },
  handleResource: { label: "Handle Resource Tree", color: "#84cc16" },
  handleCraft: { label: "Handle Craft Tree", color: "#f59e0b" },
  action: { label: "Action", color: "#f97316" },
  getRecipe: { label: "Get Recipe", color: "#f97316" },
  setRecipe: { label: "Set Recipe", color: "#f97316" },
  logOut: { label: "Log", color: "#eab308" },
  getBBValue: { label: "Get B.B. Value", color: "#eab308" },
  random: { label: "Random", color: "#dc2626" },
  randomSelector: { label: "Random Selector", color: "#dc2626" },
  randomSequence: { label: "Random Sequence", color: "#2563eb" },
  not: { label: "Not", color: "#f59e0b" },
  parallel: { label: "Parallel", color: "#10b981" },
  untilSuccess: { label: "Until Success", color: "#84cc16" },
  untilFailure: { label: "Until Failure", color: "#ec4899" },
  repeat: { label: "Repeat", color: "#eab308" },
};

// Custom React node with icon, description input, and handles
function BTNode({
  data,
  selected,
}: {
  data: any;
  selected: boolean;
}) {
  const Icon = icons[data.type as BTType];
  const hasInputs = data.type !== "start";
  const hasOutputs = !(
    data.type === "action" ||
    data.type === "subtree" ||
    data.type === "condition" ||
    data.type === "hasResource" ||
    data.type === "handleResource" ||
    data.type === "handleCraft" ||
    data.type === "getResource" ||
    data.type === "logOut" ||
    data.type === "hasRecipe" ||
    data.type === "hasBBValue" ||
    data.type === "getRecipe" ||
    data.type === "setRecipe" ||
    data.type === "getBBValue"
  );
  const [description, setDescription] = useState(data.description || "");
  const [showDesc, setShowDesc] = useState(false);

  // Dynamic font size for label auto-fit
  const labelRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(12);
  const maxFontSize = 12;
  const minFontSize = 7;
  const nodeLabelWidth = 80; // px, adjust as needed for your layout

  useLayoutEffect(() => {
    if (!labelRef.current) return;
    let size = maxFontSize;
    labelRef.current.style.fontSize = `${size}px`;
    labelRef.current.style.whiteSpace = "nowrap";
    while (
      labelRef.current.scrollWidth > nodeLabelWidth &&
      size > minFontSize
    ) {
      size -= 1;
      labelRef.current.style.fontSize = `${size}px`;
    }
    setFontSize(size);
  }, [data.label]);

  useEffect(() => {
    data.description = description;
    // eslint-disable-next-line
  }, [description]);

  return (
    <div
      className={`w-32 rounded border ${
        selected ? "border-cyan-400" : "border-neutral-600"
      } bg-[#2b2b2b] text-[7px] shadow ${
        selected ? "shadow-[4px_4px_12px_rgba(100,255,218,0.3)]" : ""
      }`}
      style={{ fontSize: 10, minHeight: 48, minWidth: 96, position: "relative" }}
    >
      {hasInputs && (
        <Handle
          type="target"
          position={Position.Top}
          id="default"
          style={{
            left: "50%",
            top: -8,
            background: "#67e8f9",
            border: "2px solid #fff",
            width: 12,
            height: 12,
            borderRadius: "50%",
            transform: "translate(-50%, 0)",
          }}
        />
      )}
      <div className="p-1">
        <div className="flex items-center gap-2">
          <Icon className="text-base flex-shrink-0" style={{ color: meta[data.type as BTType].color }} />
          <span
            ref={labelRef}
            style={{
              fontWeight: "bold",
              fontSize,
              lineHeight: "1.1",
              maxWidth: nodeLabelWidth,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            className="leading-tight"
            title={data.label}
          >
            {data.label}
          </span>
        </div>
        <button
          onClick={() => setShowDesc(!showDesc)}
          className="text-[10px] text-neutral-400 hover:text-neutral-200 mt-1 w-full text-left"
        >
          {showDesc ? "−" : "+"} desc
        </button>
        {showDesc ? (
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            className="w-full mt-1 px-1 py-1 text-xs bg-[#1a1a1a] border border-neutral-600 rounded text-neutral-200 placeholder-neutral-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="w-full mt-1 px-1 py-1 text-xs text-neutral-300 truncate" title={description}>
            {description}
          </div>
        )}
      </div>
      {hasOutputs && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          style={{
            left: "50%",
            bottom: -8,
            background: "#67e8f9",
            border: "2px solid #fff",
            width: 12,
            height: 12,
            borderRadius: "50%",
            transform: "translate(-50%, 0)",
          }}
        />
      )}
    </div>
  );
}

const nodeTypes = { bt: BTNode };

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

const SIDEBAR = "w-48 shrink-0 bg-[#1d1d1d] border-r border-neutral-700 p-4";
const BTN =
  "w-full px-2 py-1.5 text-xs rounded border border-neutral-600 hover:border-neutral-400 transition-colors bg-[#2b2b2b] hover:bg-[#3a3a3a]";
const CONTROL_BTN =
  "w-8 h-8 flex items-center justify-center rounded bg-[#2b2b2b] border border-neutral-600 hover:bg-[#3a3a3a] text-neutral-200 text-sm";

/* ------------------------------------------------------------------ */
/*  Custom Edge Component */
/* ------------------------------------------------------------------ */
function CustomEdge({ sourceX, sourceY, targetX, targetY, style, markerEnd }: any) {
  const midY = sourceY + Math.abs(targetY - sourceY) * 0.3;
  const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
  return (
    <path
      d={path}
      style={style}
      fill="none"
      className="react-flow__edge-path"
      markerEnd={markerEnd}
    />
  );
}

function CustomConnectionLine({ fromX, fromY, toX, toY }: any) {
  const midY = fromY + Math.abs(toY - fromY) * 0.3;
  const path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
  return (
    <g>
      <defs>
        <marker
          id="connection-arrow-small"
          markerWidth="4"
          markerHeight="4"
          refX="3"
          refY="1.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,3 L3,1.5 z" fill="#64ffda" />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="#64ffda"
        strokeWidth={1.5}
        strokeDasharray="3,3"
        className="animated"
        markerEnd="url(#connection-arrow-small)"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom MiniMap Component */
/* ------------------------------------------------------------------ */
interface CustomMiniMapProps {
  nodes: Node[]
  edges: Edge[]
  isVisible: boolean
}
function CustomMiniMap({ nodes, edges, isVisible }: CustomMiniMapProps) {
  const { getViewport, setViewport } = useReactFlow();
  const [viewport, setViewportState] = useState({ x: 0, y: 0, zoom: 1 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const vp = getViewport();
      setViewportState(vp);
    };

    updateViewport();
    const interval = setInterval(updateViewport, 100);

    return () => clearInterval(interval);
  }, [getViewport]);

  const getNodeBounds = useCallback(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 200, maxY: 200 };

    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY;

    nodes.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = 48;
      const height = 40;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    const padding = 50;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  }, [nodes]);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#232323";
    ctx.globalAlpha = 0.95;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    const bounds = getNodeBounds();
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const padding = 10;
    const availableWidth = canvas.width - padding * 2;
    const availableHeight = canvas.height - padding * 2;
    const scale = Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight);

    const scaledWidth = boundsWidth * scale;
    const scaledHeight = boundsHeight * scale;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    ctx.strokeStyle = "#64ffda";
    ctx.lineWidth = 1;
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourceX = (sourceNode.position.x - bounds.minX) * scale + offsetX + 24 * scale;
        const sourceY = (sourceNode.position.y - bounds.minY) * scale + offsetY + 20 * scale;
        const targetX = (targetNode.position.x - bounds.minX) * scale + offsetX + 24 * scale;
        const targetY = (targetNode.position.y - bounds.minY) * scale + offsetY + 20 * scale;
        const midY = sourceY + Math.abs(targetY - sourceY) * 0.3;

        ctx.beginPath();
        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(sourceX, midY);
        ctx.lineTo(targetX, midY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
    });

    nodes.forEach((node) => {
      const x = (node.position.x - bounds.minX) * scale + offsetX;
      const y = (node.position.y - bounds.minY) * scale + offsetY;
      const width = 48 * scale;
      const height = 40 * scale;

      const nodeColor = meta[node.data.type as BTType]?.color || "#64ffda";

      ctx.fillStyle = nodeColor;
      ctx.fillRect(x, y, width, height);

      if (node.selected) {
        ctx.strokeStyle = "#64ffda";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
      }
    });

    const viewportWidth = (canvas.width / viewport.zoom) * scale;
    const viewportHeight = (canvas.height / viewport.zoom) * scale;
    const viewportX = (-viewport.x - bounds.minX) * scale + offsetX;
    const viewportY = (-viewport.y - bounds.minY) * scale + offsetY;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    ctx.setLineDash([]);
  }, [nodes, edges, viewport, isVisible, getNodeBounds]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleMouseMove(e);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging && e.type !== "mousedown") return;
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const bounds = getNodeBounds();
      const boundsWidth = bounds.maxX - bounds.minX;
      const boundsHeight = bounds.maxY - bounds.minY;

      const padding = 10;
      const availableWidth = canvas.width - padding * 2;
      const availableHeight = canvas.height - padding * 2;
      const scale = Math.min(availableWidth / boundsWidth, availableHeight / boundsHeight);

      const scaledWidth = boundsWidth * scale;
      const scaledHeight = boundsHeight * scale;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;

      const worldX = (x - offsetX) / scale + bounds.minX;
      const worldY = (y - offsetY) / scale + bounds.minY;

      const newViewport = {
        x: -worldX + window.innerWidth / 2,
        y: -worldY + window.innerHeight / 2,
        zoom: viewport.zoom,
      };

      setViewport(newViewport);
    },
    [isDragging, viewport.zoom, setViewport, getNodeBounds]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging, handleMouseUp]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute bottom-4 left-4 w-48 h-32"
      style={{
        background: "rgba(35,35,35,0.95)",
        border: "1px solid #374151",
        borderRadius: 8,
        cursor: "pointer",
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} width={192} height={128} className="w-full h-full rounded" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Blackboard Component (fully included) */
/* ------------------------------------------------------------------ */
interface BlackboardEntry {
  id: string
  name: string
  type: "float" | "int" | "string" | "boolean" | "vec3"
  value: any
}
function Blackboard({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) {
  const [entries, setEntries] = useState<BlackboardEntry[]>([])
  const [newEntryName, setNewEntryName] = useState("")
  const [newEntryType, setNewEntryType] = useState<BlackboardEntry["type"]>("string")

  const addEntry = () => {
    if (!newEntryName.trim()) return

    const defaultValues = {
      float: 0.0,
      int: 0,
      string: "",
      boolean: false,
      vec3: { x: 0, y: 0, z: 0 },
    }

    const newEntry: BlackboardEntry = {
      id: Date.now().toString(),
      name: newEntryName.trim(),
      type: newEntryType,
      value: defaultValues[newEntryType],
    }

    setEntries([...entries, newEntry])
    setNewEntryName("")
  }

  const updateEntry = (id: string, value: any) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, value } : entry)))
  }

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
  }

  const renderValueInput = (entry: BlackboardEntry) => {
    const inputClass = "w-full px-2 py-1 text-xs bg-[#1a1a1a] border border-neutral-600 rounded text-neutral-200"

    switch (entry.type) {
      case "float":
        return (
          <input
            type="number"
            step="0.1"
            value={entry.value}
            onChange={(e) => updateEntry(entry.id, Number.parseFloat(e.target.value) || 0)}
            className={inputClass}
          />
        )
      case "int":
        return (
          <input
            type="number"
            step="1"
            value={entry.value}
            onChange={(e) => updateEntry(entry.id, Number.parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        )
      case "string":
        return (
          <input
            type="text"
            value={entry.value}
            onChange={(e) => updateEntry(entry.id, e.target.value)}
            className={inputClass}
          />
        )
      case "boolean":
        return (
          <select
            value={entry.value.toString()}
            onChange={(e) => updateEntry(entry.id, e.target.value === "true")}
            className={inputClass}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
        )
      case "vec3":
        return (
          <div className="flex gap-1">
            <input
              type="number"
              step="1"
              placeholder="X"
              value={entry.value.x}
              onChange={(e) => updateEntry(entry.id, { ...entry.value, x: Number.parseInt(e.target.value) || 0 })}
              className={`${inputClass} w-1/3`}
            />
            <input
              type="number"
              step="1"
              placeholder="Y"
              value={entry.value.y}
              onChange={(e) => updateEntry(entry.id, { ...entry.value, y: Number.parseInt(e.target.value) || 0 })}
              className={`${inputClass} w-1/3`}
            />
            <input
              type="number"
              step="1"
              placeholder="Z"
              value={entry.value.z}
              onChange={(e) => updateEntry(entry.id, { ...entry.value, z: Number.parseInt(e.target.value) || 0 })}
              className={`${inputClass} w-1/3`}
            />
          </div>
        )
      default:
        return null
    }
  }

  if (!isVisible) return null

  return (
    <div className="absolute top-0 right-0 w-80 h-[calc(100%-3.5rem)] bg-[#1d1d1d] border-l border-t border-neutral-700 p-4 z-20 overflow-y-auto" style={{ top: "3.5rem" /* 40px */ }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-100 text-sm flex items-center gap-2">
          <FaClipboardList />
          Blackboard
        </h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
          <FaTimes />
        </button>
      </div>

      <div className="mb-4 p-3 bg-[#2b2b2b] rounded border border-neutral-600">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Variable name"
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-[#1a1a1a] border border-neutral-600 rounded text-neutral-200"
          />
          <select
            value={newEntryType}
            onChange={(e) => setNewEntryType(e.target.value as BlackboardEntry["type"])}
            className="px-2 py-1 text-xs bg-[#1a1a1a] border border-neutral-600 rounded text-neutral-200"
          >
            <option value="string">String</option>
            <option value="int">Int</option>
            <option value="float">Float</option>
            <option value="boolean">Boolean</option>
            <option value="vec3">Vec3</option>
          </select>
        </div>
        <button
          onClick={addEntry}
          className="w-full px-2 py-1 text-xs rounded border border-neutral-600 hover:border-neutral-400 transition-colors bg-[#3a3a3a] hover:bg-[#4a4a4a]"
        >
          Add Variable
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="p-3 bg-[#2b2b2b] rounded border border-neutral-600">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-xs text-neutral-200">{entry.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 bg-[#1a1a1a] px-2 py-0.5 rounded">{entry.type}</span>
                <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-300 text-xs">
                  <FaTimes />
                </button>
              </div>
            </div>
            {renderValueInput(entry)}
            {entry.type === "vec3" && (
              <div className="text-xs text-neutral-400 mt-1">
                Value: ({entry.value.x}, {entry.value.y}, {entry.value.z})
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center text-neutral-400 text-xs mt-8">
          No variables defined yet.
          <br />
          Add your first variable above.
        </div>
      )}
    </div>
  )
}


/* ------------------------------------------------------------------ */
/*  FlowCanvas – inside ReactFlowProvider */
/* ------------------------------------------------------------------ */
interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: (changes: any) => void;
  onConnect: (c: Connection) => void;
  addNode: (t: BTType, p: { x: number; y: number }) => void;
  selectedNodes: string[];
  deleteSelectedNodes: () => void;
  undo: () => void;
  redo: () => void;
}

function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  addNode,
  selectedNodes,
  deleteSelectedNodes,
  undo,
  redo
}: CanvasProps) {
  const {
    zoomIn,
    zoomOut,
    fitView,
    screenToFlowPosition,
    setEdges,
  } = useReactFlow();
  const [showMini, setShowMini] = useState(true);
  const [showBlackboard, setShowBlackboard] = useState(false);
  const [animatedLines, setAnimatedLines] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [ctx, setCtx] = useState({
    open: false,
    x: 0,
    y: 0,
    scrX: 0,
    scrY: 0,
  });

  const GRID = 8;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Helper: Find a non-overlapping position
  function getNonOverlappingPosition(flowPos: { x: number; y: number }, nodes: Node[], nodeSize = { w: 96, h: 48 }, offsetStep = 60) {
    let { x, y } = flowPos;
    let tryCount = 0;
    while (
      nodes.some(
        node =>
          Math.abs(node.position.x - x) < nodeSize.w &&
          Math.abs(node.position.y - y) < nodeSize.h
      )
      && tryCount < 10
    ) {
      x += offsetStep;
      y += offsetStep;
      tryCount++;
    }
    return { x, y };
  }

  // Node creation at viewport center via a custom event (used by sidebar)
  useEffect(() => {
    function handleAddNodeEvent(e: any) {
      const type: BTType = e.detail.type;
      let centerScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      if (reactFlowWrapper.current) {
        const rect = reactFlowWrapper.current.getBoundingClientRect();
        centerScreen = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      const flowPos = screenToFlowPosition(centerScreen);
      const pos = getNonOverlappingPosition(flowPos, nodes);
      addNode(type, pos);
    }
    window.addEventListener("addNodeAtViewportCenter", handleAddNodeEvent);
    return () => window.removeEventListener("addNodeAtViewportCenter", handleAddNodeEvent);
  }, [screenToFlowPosition, nodes, addNode]);

  useEffect(() => {
    const handleWindowBlur = () => {
      if (isConnecting) setIsConnecting(false);
    };
    window.addEventListener("blur", handleWindowBlur);
    return () =>
      window.removeEventListener("blur", handleWindowBlur);
  }, [isConnecting]);

  useEffect(() => {
    if (edges.length === 0) return;
    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        style: {
          stroke: "#64ffda",
          strokeWidth: 1.5,
          ...(animatedLines && { strokeDasharray: "3,3" }),
        },
        animated: animatedLines,
      }))
    );
  }, [animatedLines, setEdges, edges.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
      }
      // If an input or textarea is focused, do not delete nodes
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      if ((tag === "INPUT" || tag === "TEXTAREA")) return;

      if (e.key === "Delete" && selectedNodes.length > 0)
        deleteSelectedNodes();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedNodes, deleteSelectedNodes]);

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isConnecting) setIsConnecting(false);
    const flowPosition = screenToFlowPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setTimeout(() => {
      setCtx({
        open: true,
        x: flowPosition.x,
        y: flowPosition.y,
        scrX: e.clientX,
        scrY: e.clientY,
      });
    }, 0);
  };

  const closeMenu = () =>
    setCtx((c) => ({ ...c, open: false }));

  const exportPNG = useCallback(async () => {
    if (!reactFlowWrapper.current) {
      console.error("React Flow container not found");
      return;
    }
    const minExportWidth = 2000;
    const minExportHeight = 1200;
    const maxPixelRatio = 16;
    const node = reactFlowWrapper.current;
    const rect = node.getBoundingClientRect();
    const widthRatio = minExportWidth / rect.width;
    const heightRatio = minExportHeight / rect.height;
    const pixelRatio = Math.min(
      Math.max(widthRatio, heightRatio, window.devicePixelRatio),
      maxPixelRatio
    );
    try {
      fitView({ padding: 0.1, duration: 200 });
      await new Promise((resolve) => setTimeout(resolve, 400));
      const imageUrl = await toPng(node, {
        backgroundColor: "#1b1b1b",
        pixelRatio,
      });
      const link = document.createElement("a");
      link.download = `behavior-tree-${Date.now()}.png`;
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PNG. Check console for details.");
    }
  }, [fitView]);

  return (
    <main className="flex-1 relative" ref={reactFlowWrapper}>
      <style jsx>{`
        @keyframes dashdraw {
          to {
            stroke-dashoffset: -6;
          }
        }
        .animated {
          animation: dashdraw 1s linear infinite;
        }
      `}</style>

      <div className="absolute top-4 left-4 z-10 flex gap-1">
        <button
          className={`${CONTROL_BTN} ${
            animatedLines ? "bg-cyan-600 border-cyan-500" : ""
          }`}
          onClick={() => setAnimatedLines(!animatedLines)}
          title="Toggle Line Animation"
        >
          <FaWaveSquare />
        </button>
        <button
          className={CONTROL_BTN}
          onClick={exportPNG}
          title="Export PNG"
        >
          <FaCamera />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-1">
        <button
          className={`${CONTROL_BTN} ${showBlackboard ? "bg-cyan-600 border-cyan-500" : ""}`}
          onClick={() => setShowBlackboard((v) => !v)}
          title="Toggle Blackboard"
        >
          <FaClipboardList />
        </button>
        <button
          className={`${CONTROL_BTN} ${showMini ? "bg-cyan-600 border-cyan-500" : ""}`}
          onClick={() => setShowMini((v) => !v)}
          title="Toggle Mini Map"
        >
          <FaMap />
        </button>
        <button
          className={CONTROL_BTN}
          onClick={() => zoomIn()}
          title="Zoom In"
        >
          +
        </button>
        <button
          className={CONTROL_BTN}
          onClick={() => zoomOut()}
          title="Zoom Out"
        >
          −
        </button>
        <button
          className={CONTROL_BTN}
          onClick={() => fitView()}
          title="Fit View"
        >
          ⌂
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => setIsConnecting(true)}
        onConnectEnd={() => setIsConnecting(false)}
        onPaneContextMenu={openMenu}
        onPaneClick={closeMenu}
        snapToGrid
        snapGrid={[GRID, GRID]}
        fitView
        className="bg-[#1b1b1b]"
        defaultEdgeOptions={{
          type: "custom",
          style: { stroke: "#64ffda", strokeWidth: 1.5 },
          markerEnd: {
            type: "arrowclosed",
            color: "#64ffda",
            width: 6,
            height: 6,
          },
        }}
        connectionLineComponent={CustomConnectionLine}
        connectionLineType={ConnectionLineType.Straight}
        panOnDrag={[2]}
        selectionOnDrag={true}
        panOnScroll={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={GRID} size={0.5} color="#5c5c5c" />
        <CustomMiniMap nodes={nodes} edges={edges} isVisible={showMini} />
      </ReactFlow>

      <Blackboard isVisible={showBlackboard} onClose={() => setShowBlackboard(false)} />

      {ctx.open && (
        <ul
          style={{
            position: "fixed",
            left: ctx.scrX,
            top: ctx.scrY,
            zIndex: 1000,
          }}
          className="p-2 bg-[#2b2b2b] border border-neutral-700 rounded shadow space-y-1 text-xs"
        >
          {(Object.keys(icons) as BTType[]).map((t) => {
            const Icon = icons[t];
            return (
              <li
                key={t}
                onClick={() => {
                  addNode(t, { x: ctx.x, y: ctx.y });
                  closeMenu();
                }}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#3a3a3a] cursor-pointer whitespace-nowrap"
              >
                <Icon style={{ color: meta[t].color }} /> {meta[t].label}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  BehaviorTreeEditor – top level */
/* ------------------------------------------------------------------ */
export default function BehaviorTreeEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [id, setId] = useState(1);

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const selectedNodes = nodes
    .filter((node) => node.selected)
    .map((node) => node.id);

  const GRID = 8;

  const snap = (v: number) => Math.round(v / GRID) * GRID;
  const addNode = (type: BTType, pos: { x: number; y: number }) => {
    setNodes((nds) => [
      ...nds,
      {
        id: String(id),
        type: "bt",
        position: { x: snap(pos.x), y: snap(pos.y) },
        data: { type, label: meta[type].label, description: "" },
      },
    ]);
    setId((n) => n + 1);
  };

  const pushToHistory = useCallback(() => {
    setHistory((h) => [...h, {nodes, edges}]);
    setFuture([]); // clear future on new action
  }, [nodes, edges]);

  // Undo handler
  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [{ nodes, edges }, ...f]);
      setNodes(prev.nodes);
      setEdges(prev.edges);
      return h.slice(0, -1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  // Redo handler
  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return f.slice(1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  const deleteSelectedNodes = useCallback(() => {
    pushToHistory();
    const selectedNodeIds = new Set(selectedNodes);

    setNodes((nds) =>
      nds.filter((node) => !selectedNodeIds.has(node.id))
    );
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target)
      )
    );
  }, [pushToHistory, selectedNodes, setNodes, setEdges]);

  const clearAll = useCallback(() => {
    setHistory((h) => [...h, { nodes, edges }]);
    setFuture([]);
    setNodes([]);
    setEdges([]);
    setId(1);
  }, [nodes, edges, setNodes, setEdges, setId]);

  const onConnect = useCallback(
    (c: Connection) =>
      setEdges((es) =>
        addEdge(
          {
            ...c,
            type: "custom",
            style: { stroke: "#64ffda", strokeWidth: 1.5 },
            markerEnd: {
              type: "arrowclosed",
              color: "#64ffda",
              width: 6,
              height: 6,
            },
          },
          es
        )
      ),
    [setEdges]
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const exportJSON = () => {
    const blob = new Blob(
      [JSON.stringify({ nodes, edges }, null, 2)],
      {
        type: "application/json",
      }
    );
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url,
      download: "tree.json",
    }).click();
    URL.revokeObjectURL(url);
  };
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        setId(
          Math.max(
            1,
            ...((data.nodes as Node[]).map((n) => Number(n.id)) || [0])
          ) + 1
        );
      } catch {
        alert("Invalid JSON");
      }
    };
    rd.readAsText(f);
    e.target.value = "";
  };

  // Sidebar triggers addNodeAtViewportCenter event
  function handleSidebarAddNode(type: BTType) {
    window.dispatchEvent(new CustomEvent("addNodeAtViewportCenter", { detail: { type } }));
  }

  return (
    <div className="h-screen flex bg-[#161616] text-neutral-200">
      <aside className={`${SIDEBAR} h-screen overflow-y-auto`}>
        <div className="space-y-1.5">
          {(Object.keys(icons) as BTType[]).map((t) => {
            const Icon = icons[t];
            return (
              <button
                key={t}
                className={BTN}
                onClick={() => handleSidebarAddNode(t)}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="text-xs"
                    style={{ color: meta[t].color }}
                  />
                  <span className="text-xs">{meta[t].label}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-1.5">
          <button onClick={exportJSON} className={BTN}>
            <span className="text-xs">Export JSON</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className={BTN}
          >
            <span className="text-xs">Import JSON</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={importJSON}
          />
          <button
            onClick={clearAll}
            className={BTN}
          >
            <span className="text-xs">Clear All</span>
          </button>
        </div>
      </aside>

      <ReactFlowProvider>
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          addNode={addNode}
          selectedNodes={selectedNodes}
          deleteSelectedNodes={deleteSelectedNodes}
          undo={undo}
          redo={redo}
        />
      </ReactFlowProvider>
    </div>
  );
}