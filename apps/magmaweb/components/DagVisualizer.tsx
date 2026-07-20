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
  EdgeLabelRenderer,
  getSmoothStepPath,
} from '@xyflow/react'

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

// --- 💡 1. カスタムノード ---
const CustomNode = ({ data }: any) => {
  return (
    <div style={data.style}>
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      
      {/* 右側の接続口（迂回用） */}
      <Handle type="target" position={Position.Right} id="right-target" style={{ opacity: 0, top: '30%' }} />
      <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0, top: '70%' }} />

      {/* 左側の接続口（定理ノード用） */}
      <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0, top: '50%' }} />
      <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0, top: '50%' }} />

      {data.content}
    </div>
  )
}

// --- 💡 2. 重なり回避 ＆ 3箇所ラベル表示付きカスタムエッジ ---
const CustomEdgeWithLabels = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const jumpIndex = data?.jumpIndex || 0
  const isBypass = data?.isBypass || false

  let edgePath = ''
  let labelPos = { startX: 0, startY: 0, midX: 0, midY: 0, endX: 0, endY: 0 }

  if (isBypass) {
    // 💡 左右の重なりを回避するために jumpIndex で膨らみ幅（xOffset）を変える
    // 定理（左側）への接続なら左に膨らませ、通常（右側）なら右に膨らませる
    const isLeft = targetX < sourceX
    const baseOffset = 80 + jumpIndex * 40
    const xOffset = isLeft ? -baseOffset : baseOffset
    const routeX = isLeft 
      ? Math.min(sourceX, targetX) + xOffset 
      : Math.max(sourceX, targetX) + xOffset

    const r = 15
    const dir = targetY > sourceY ? 1 : -1
    const actualR = Math.min(r, Math.abs(targetY - sourceY) / 2)

    edgePath = `
      M ${sourceX} ${sourceY}
      L ${routeX - (isLeft ? -actualR : actualR)} ${sourceY}
      Q ${routeX} ${sourceY} ${routeX} ${sourceY + actualR * dir}
      L ${routeX} ${targetY - actualR * dir}
      Q ${routeX} ${targetY} ${routeX - (isLeft ? -actualR : actualR)} ${targetY}
      L ${targetX} ${targetY}
    `

    // ラベル位置の計算（根本: 15%, 中央: 50%, 先端: 85%）
    labelPos.startX = sourceX + (routeX - sourceX) * 0.4
    labelPos.startY = sourceY
    labelPos.midX = routeX
    labelPos.midY = (sourceY + targetY) / 2
    labelPos.endX = targetX + (routeX - targetX) * 0.4
    labelPos.endY = targetY

  } else {
    // 通常の標準ステップエッジ
    const [path] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 12,
    })
    edgePath = path

    labelPos.startX = sourceX + (targetX - sourceX) * 0.15
    labelPos.startY = sourceY + (targetY - sourceY) * 0.15
    labelPos.midX = (sourceX + targetX) / 2
    labelPos.midY = (sourceY + targetY) / 2
    labelPos.endX = sourceX + (targetX - sourceX) * 0.85
    labelPos.endY = sourceY + (targetY - sourceY) * 0.85
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      
      {/* 💡 根本・中央・先端の3箇所に情報を描画 */}
      <EdgeLabelRenderer>
        {/* ① 根本付近：つながる先のノードID */}
        <div
          style={{
            ...styles.edgeLabelBase,
            transform: `translate(-50%, -50%) translate(${labelPos.startX}px, ${labelPos.startY}px)`,
            backgroundColor: '#e2e8f0',
            color: '#334155',
          }}
          className="nodrag nopan"
        >
          To: {target}
        </div>

        {/* ② 中央付近：どのノードからどのノードへ繋がっているか */}
        <div
          style={{
            ...styles.edgeLabelBase,
            transform: `translate(-50%, -50%) translate(${labelPos.midX}px, ${labelPos.midY}px)`,
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          className="nodrag nopan"
        >
          {source} ➔ {target}
        </div>

        {/* ③ 先端付近：どのノードから出てきたか */}
        <div
          style={{
            ...styles.edgeLabelBase,
            transform: `translate(-50%, -50%) translate(${labelPos.endX}px, ${labelPos.endY}px)`,
            backgroundColor: '#e2e8f0',
            color: '#334155',
          }}
          className="nodrag nopan"
        >
          From: {source}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const nodeTypes = { custom: CustomNode }
const edgeTypes = { customEdge: CustomEdgeWithLabels }

export default function DagVisualizer({ graphData }: DagVisualizerProps) {
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) {
    return (
      <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '12px' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>データエラー</h4>
        <p style={{ margin: 0 }}>グラフデータが不正です。</p>
      </div>
    )
  }

  const { nodes: rawNodes, edges: rawEdges } = graphData

  const nodeIndexMap = useMemo(() => {
    const map = new Map<string, number>()
    rawNodes.forEach((n, i) => map.set(n.id, i))
    return map
  }, [rawNodes])

  // --- ノード配置 ---
  const flowNodes = useMemo<Node[]>(() => {
    let propCount = 0

    return rawNodes.map((node, index) => {
      const isProposition = node.type === 'proposition'
      const isTheorem = node.type === 'theorem'

      let x = 400
      if (isTheorem) {
        x = 30 // 定理ノードは左側へ配置
      } else if (isProposition) {
        x = propCount % 2 === 0 ? 370 : 430
        propCount++
      }

      const y = index * 180 // 縦間隔をしっかり空ける

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
            width: 280,
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

  // --- エッジルーティング ---
  const flowEdges = useMemo<Edge[]>(() => {
    let rightJumpCounter = 0
    let leftJumpCounter = 0

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
      let isBypass = false
      let jumpIndex = 0

      // 定理ノード（左側）への接続、または離れたノードへのジャンク接続の判定
      if (isToTheorem) {
        sourceHandle = 'left-source'
        targetHandle = 'left-target'
        isBypass = true
        jumpIndex = leftJumpCounter++
      } else if (isFromTheorem) {
        sourceHandle = 'right-source'
        targetHandle = 'left-target'
        isBypass = true
        jumpIndex = leftJumpCounter++
      } else if (isJump) {
        sourceHandle = 'right-source'
        targetHandle = 'right-target'
        isBypass = true
        jumpIndex = rightJumpCounter++
      }

      const strokeColor = '#475569'

      return {
        id: `e-${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        sourceHandle,
        targetHandle,
        type: 'customEdge',
        animated: true,
        data: { jumpIndex, isBypass },
        style: {
          stroke: strokeColor,
          strokeWidth: 2,
          opacity: 0.8,
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
      <h3 style={styles.title}>論理構造 DAG モニター</h3>
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
  canvasWrapper: { width: '100%', height: '700px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' as const },
  nodeContent: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  nodeHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  propositionBadge: { fontSize: '10px', fontWeight: 'bold' as const, color: '#4D96FF', backgroundColor: '#edf4ff', padding: '1px 6px', borderRadius: '4px' },
  inferenceBadge: { fontSize: '10px', fontWeight: 'bold' as const, color: '#6BCB77', backgroundColor: '#eefaf0', padding: '1px 6px', borderRadius: '4px' },
  theoremBadge: { fontSize: '10px', fontWeight: 'bold' as const, color: '#ea580c', backgroundColor: '#ffedd5', padding: '1px 6px', borderRadius: '4px' },
  nodeId: { fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' },
  nodeLabel: { fontSize: '12px', fontWeight: 500, whiteSpace: 'pre-wrap' as const, fontFamily: 'Consolas, Monaco, monospace', wordBreak: 'break-all' as const, lineHeight: 1.4 },
  edgeLabelBase: {
    position: 'absolute' as const,
    fontSize: '9px',
    padding: '2px 5px',
    borderRadius: '4px',
    pointerEvents: 'none' as const,
    whiteSpace: 'nowrap' as const,
    zIndex: 100,
  },
}
