// @ts-nocheck
'use client'

import React, { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position,
  Handle,
  BaseEdge,
  EdgeProps,
} from '@xyflow/react'

// @ts-ignore
import '@xyflow/react/dist/style.css'

type GraphNode = {
  id: string
  label: string
  type: 'proposition' | 'inference' | 'theorem'
}

type GraphEdge = {
  from: string
  to: string
}

type DagVisualizerProps = {
  graphData: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  }
}

// --- 💡 1. 線の出入り口を自由に制御するためのカスタムノード ---
const CustomNode = ({ data }: any) => {
  return (
    <div style={data.style}>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      
      {/* 迂回ルート用：右側の接続口 */}
      <Handle type="target" position={Position.Right} id="right-target" style={{ opacity: 0, top: '30%' }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0, top: '70%' }} />

      {/* 定理ノード接続用：左側の接続口 */}
      <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0, top: '50%' }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0, top: '50%' }} />

      {data.content}
    </div>
  )
}

// --- 💡 2. 複数の線が重ならないように自動でずらす「カスタムエッジ」 ---
const BypassEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  // jumpIndexを使って、線が重ならないように右側へ大きく膨らませる
  const jumpIndex = data?.jumpIndex || 0;
  // 1本目は右に80px、2本目は130px、3本目は180px...と完全に間隔を空ける
  const xOffset = 80 + jumpIndex * 50;
  const routeX = Math.max(sourceX, targetX) + xOffset;

  const r = 20; // 角の丸み
  const dir = targetY > sourceY ? 1 : -1;
  const actualR = Math.min(r, Math.abs(targetY - sourceY) / 2);

  // 右に出て、下（上）へ向かい、左へ戻ってノードに入る手動ルート
  const path = `
    M ${sourceX} ${sourceY}
    L ${routeX - actualR} ${sourceY}
    Q ${routeX} ${sourceY} ${routeX} ${sourceY + actualR * dir}
    L ${routeX} ${targetY - actualR * dir}
    Q ${routeX} ${targetY} ${routeX - actualR} ${targetY}
    L ${targetX} ${targetY}
  `;

  return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
}

// 登録
const nodeTypes = { custom: CustomNode }
const edgeTypes = { bypass: BypassEdge } 

export default function DagVisualizer({ graphData }: DagVisualizerProps) {
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
    return (
      <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>データエラー</h4>
        <p style={{ margin: 0 }}>グラフデータが不正です。</p>
      </div>
    );
  }

  const { nodes: rawNodes, edges: rawEdges } = graphData

  const nodeIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    rawNodes.forEach((n, i) => map.set(n.id, i))
    return map
  }, [rawNodes])

  // --- ノードの配置 ---
  const flowNodes = useMemo<Node[]>(() => {
    let propCount = 0;
    
    return rawNodes.map((node, index) => {
      const isProposition = node.type === 'proposition'
      const isTheorem = node.type === 'theorem'
      
      let x = 380; // 推論ノードの基本位置
      if (isTheorem) {
        x = 40; // 定理ノードは左端へ
      } else if (isProposition) {
        // 命題ノードは少しジグザグにして縦の直線かぶりを防ぐ
        x = propCount % 2 === 0 ? 350 : 410;
        propCount++;
      }
      
      // 縦の間隔をしっかり開ける
      const y = index * 160

      let background = '#f8fafc'
      let borderColor = '#6BCB77'
      if (isProposition) {
        background = '#ffffff'
        borderColor = '#4D96FF'
      } else if (isTheorem) {
        background = '#fff7ed'
        borderColor = '#f97316'
      }

      return {
        id: node.id,
        type: 'custom',
        position: { x, y },
        data: {
          style: {
            background,
            borderColor,
            borderWidth: '2px',
            borderStyle: 'solid',
            borderLeft: `6px solid ${borderColor}`,
            borderRadius: '10px',
            color: '#1e293b',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            width: 300,
            textAlign: 'left' as const,
            padding: '12px',
            zIndex: isTheorem ? 1 : 10,
          },
          content: (
            <div style={styles.nodeContent}>
              <div style={styles.nodeHeader}>
                {isProposition && <span style={styles.propositionBadge}>命題</span>}
                {node.type === 'inference' && <span style={styles.inferenceBadge}>推論</span>}
                {isTheorem && <span style={styles.theoremBadge}>定義・定理</span>}
                <span style={styles.nodeId}>{node.id}</span>
              </div>
              <div style={styles.nodeLabel}>{node.label}</div>
            </div>
          ),
        },
      }
    })
  }, [rawNodes])

  // --- エッジ（線）のルーティング ---
  const flowEdges = useMemo<Edge[]>(() => {
    let jumpCounter = 0;

    return rawEdges.map((edge, index) => {
      const fromNode = rawNodes.find(n => n.id === edge.from)
      const toNode = rawNodes.find(n => n.id === edge.to)
      
      const fromIndex = nodeIndexMap.get(edge.from) ?? 0
      const toIndex = nodeIndexMap.get(edge.to) ?? 0
      
      const isJump = Math.abs(toIndex - fromIndex) > 1
      const isToTheorem = toNode?.type === 'theorem'
      const isFromTheorem = fromNode?.type === 'theorem'

      let sourceHandle = 'bottom'
      let targetHandle = 'top'
      let type = 'smoothstep'
      let jumpIndex = 0

      if (isToTheorem) {
        sourceHandle = 'left-source'
        targetHandle = 'right-target'
      } else if (isFromTheorem) {
        sourceHandle = 'right-source'
        targetHandle = 'left-target'
      } else if (isJump) {
        sourceHandle = 'right-source'
        targetHandle = 'right-target'
        type = 'bypass' // ★ ここでカスタムエッジを適用
        jumpIndex = jumpCounter++; 
      }

      // 💡 赤色を完全に排除し、落ち着いた濃いグレー（スレート）に統一
      const strokeColor = '#64748b' 

      return {
        id: `e-${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        sourceHandle, 
        targetHandle, 
        type,
        animated: true,
        data: { jumpIndex }, 
        style: { 
          stroke: strokeColor, 
          strokeWidth: 2.5, 
          opacity: 0.65 
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      }
    })
  }, [rawEdges, rawNodes, nodeIndexMap])

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>論理構造 DAG モニター (React Flow 版)</h3>
      <div style={styles.canvasWrapper}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#cbd5e1" gap={16} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}

const styles = {
  container: { width: '100%', display: 'flex', flexDirection: 'column' as const },
  title: { fontSize: '16px', fontWeight: 'bold' as const, color: '#334155', marginBottom: '12px', marginTop: 0 },
  canvasWrapper: { width: '100%', height: '680px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' as const },
  nodeContent: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  nodeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  propositionBadge: { fontSize: '10px', fontWeight: 'bold' as const, color: '#4D96FF', backgroundColor: '#edf4ff', padding: '1px 6px', borderRadius: '4px' },
  inferenceBadge: { fontSize: '10px', fontWeight: 'bold' as const, color: '#6BCB77', backgroundColor: '#eefaf0', padding: '1px 6px', borderRadius: '4px' },
  theoremBadge: { fontSize: '10px', fontWeight: 'bold' as const, color: '#ea580c', backgroundColor: '#ffedd5', padding: '1px 6px', borderRadius: '4px' },
  nodeId: { fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' },
  nodeLabel: { fontSize: '12px', fontWeight: 500, whiteSpace: 'pre-wrap' as const, fontFamily: 'Consolas, Monaco, monospace', wordBreak: 'break-all' as const, lineHeight: 1.4 },
}