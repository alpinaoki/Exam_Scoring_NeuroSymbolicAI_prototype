'use client'
// @ts-nocheck

import React, { useMemo, useState } from 'react'
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
  getBezierPath,
  getStraightPath,
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'

type GraphNode = { id: string; label: string; type: 'proposition' | 'inference' | 'theorem' }
type GraphEdge = { from: string; to: string }
type DagVisualizerProps = { graphData: { nodes: GraphNode[]; edges: GraphEdge[] } }

const formatLabel = (text: string) => {
  if (!text) return '不明'
  return text.trim()
}

const CustomNode = ({ data }: any) => (
  <div style={{ ...data.style, transition: 'all 0.3s ease' }}>
    <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
    <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
    <Handle type="target" position={Position.Right} id="right-target" style={{ opacity: 0, top: '50%' }} />
    <Handle type="source" position={Position.Right} id="right-source" style={{ opacity: 0, top: '50%' }} />
    <Handle type="target" position={Position.Left} id="left-target" style={{ opacity: 0, top: '50%' }} />
    <Handle type="source" position={Position.Left} id="left-source" style={{ opacity: 0, top: '50%' }} />
    {data.content}
  </div>
)

const CustomEdgeWithLabels = ({
  id, source, target, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data,
}: EdgeProps) => {
  const jumpIndex = Number(data?.jumpIndex || 0)
  const isBypass = Boolean(data?.isBypass)
  const isReference = Boolean(data?.isReference)
  const sourceLabel = String(data?.sourceLabel || '不明')
  const targetLabel = String(data?.targetLabel || '不明')
  
  // 動的スタイルの受け取り
  const edgeColor = data?.edgeColor || (isReference ? '#f97316' : '#475569')
  const edgeOpacity = data?.edgeOpacity ?? 0.6
  const strokeWidth = data?.strokeWidth || 2
  const badgeColor = data?.badgeColor || '#3b82f6'

  let edgePath = ''
  let labelX = 0
  let labelY = 0

  if (isBypass) {
    const isLeft = true 
    const baseOffset = 150 + jumpIndex * 80
    const xOffset = isLeft ? -baseOffset : baseOffset
    const routeX = Math.min(sourceX, targetX) + xOffset
    const r = 15
    const dir = targetY > sourceY ? 1 : -1
    const actualR = Math.min(r, Math.abs(targetY - sourceY) / 2)

    edgePath = `M ${sourceX} ${sourceY} L ${routeX + actualR} ${sourceY} Q ${routeX} ${sourceY} ${routeX} ${sourceY + actualR * dir} L ${routeX} ${targetY - actualR * dir} Q ${routeX} ${targetY} ${routeX + actualR} ${targetY} L ${targetX} ${targetY}`
    labelX = routeX
    labelY = (sourceY + targetY) / 2
  } else {
    const [path, cX, cY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
    edgePath = path
    labelX = cX
    labelY = cY
  }

  // 定理への参照エッジ（タグなし）
  if (isReference) {
    const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY })
    return (
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ ...style, stroke: edgeColor, strokeWidth, opacity: edgeOpacity, transition: 'all 0.3s ease' }}
      />
    )
  }

  // メインフローのエッジ（タグ付き・クリック可能）
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, stroke: edgeColor, strokeWidth, opacity: edgeOpacity, transition: 'all 0.3s ease' }}
      />
      <EdgeLabelRenderer>
        <div
          onClick={(e) => {
            e.stopPropagation()
            if (data?.onTagClick) data.onTagClick(id)
          }}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            backgroundColor: badgeColor,
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '10px',
            padding: '6px 10px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            pointerEvents: 'auto', // クリック可能に設定
            cursor: 'pointer',
            whiteSpace: 'pre-wrap',
            maxWidth: '220px',
            textAlign: 'center',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            opacity: edgeOpacity < 0.3 ? 0.2 : 1, // エッジの透明度に同期
            transition: 'all 0.3s ease',
            zIndex: 100,
          }}
          className="nodrag nopan"
        >
          <div>{sourceLabel}</div>
          <div style={{ color: '#dbeafe', margin: '2px 0', fontSize: '11px' }}>▼</div>
          <div>{targetLabel}</div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const nodeTypes = { custom: CustomNode }
const edgeTypes = { customEdge: CustomEdgeWithLabels }

export default function DagVisualizer({ graphData }: DagVisualizerProps) {
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) return <div>エラー</div>

  // 選択状態の管理
  // selectedMode: 'none' | 'node' | 'edge'
  const [selectedMode, setSelectedMode] = useState<'none' | 'node' | 'edge'>('none')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const { nodes: rawNodes, edges: rawEdges } = graphData

  // 階層計算
  const depths = useMemo(() => {
    const dMap = new Map<string, number>()
    rawNodes.forEach(n => dMap.set(n.id, 0))
    let changed = true
    let iterations = 0
    while (changed && iterations < 100) {
      changed = false
      rawEdges.forEach(edge => {
        const safeFrom = edge?.from?.trim() || ''
        const safeTo = edge?.to?.trim() || ''
        if (!safeFrom || !safeTo) return
        
        const fromDepth = dMap.get(safeFrom) || 0
        const toDepth = dMap.get(safeTo) || 0
        if (fromDepth + 1 > toDepth) {
          dMap.set(safeTo, fromDepth + 1)
          changed = true
        }
      })
      iterations++
    }
    return dMap
  }, [rawNodes, rawEdges])

  // 定理ノードの関連先を特定
  const theoremTargets = useMemo(() => {
    const map = new Map<string, string>()
    rawEdges.forEach(edge => {
      const fromNode = rawNodes.find(n => n.id === edge.from)
      const toNode = rawNodes.find(n => n.id === edge.to)
      if (fromNode?.type === 'theorem' && toNode && !map.has(fromNode.id)) {
        map.set(fromNode.id, toNode.id)
      }
      if (toNode?.type === 'theorem' && fromNode && !map.has(toNode.id)) {
        map.set(toNode.id, fromNode.id)
      }
    })
    return map
  }, [rawEdges, rawNodes])

  // ハイライト判定ロジック関数
  const getHighlightInfo = (nodeId: string) => {
    if (selectedMode === 'none') return { isHighlighted: true }
    
    if (selectedMode === 'node' && selectedNodeId) {
      if (nodeId === selectedNodeId) return { isHighlighted: true, isTargetSelf: true }
      // 接続しているノードか判定
      const isConnected = rawEdges.some(
        e => (e.from === selectedNodeId && e.to === nodeId) || (e.to === selectedNodeId && e.from === nodeId)
      )
      return { isHighlighted: isConnected }
    }

    if (selectedMode === 'edge' && selectedEdgeId) {
      const targetEdge = rawEdges.find((_, idx) => `e-${rawEdges[idx].from}-${rawEdges[idx].to}-${idx}` === selectedEdgeId)
      if (targetEdge) {
        const isConnectedNode = targetEdge.from === nodeId || targetEdge.to === nodeId
        return { isHighlighted: isConnectedNode }
      }
    }

    return { isHighlighted: false }
  }

  // ノードデータ生成
  const flowNodes = useMemo<Node[]>(() => {
    const depthGroups = new Map<number, GraphNode[]>()
    rawNodes.forEach(node => {
      if (node.type === 'theorem') return
      const d = depths.get(node.id) || 0
      if (!depthGroups.has(d)) depthGroups.set(d, [])
      depthGroups.get(d)!.push(node)
    })

    const theoremCounts = new Map<string, number>()

    return rawNodes.map((node) => {
      const isTheorem = node.type === 'theorem'
      let x = 400
      let y = 0

      if (isTheorem) {
        const targetMainId = theoremTargets.get(node.id)
        const targetDepth = targetMainId ? (depths.get(targetMainId) || 0) : 0
        
        const mainSiblings = depthGroups.get(targetDepth) || []
        const mainIndex = mainSiblings.findIndex(n => n.id === targetMainId)
        
        const spacing = 1000
        const startX = 450 - ((mainSiblings.length - 1) * spacing) / 2
        const mainX = startX + mainIndex * spacing

        const tCount = theoremCounts.get(targetMainId || '') || 0
        theoremCounts.set(targetMainId || '', tCount + 1)

        x = mainX + 600 
        y = targetDepth * 350 + (tCount * 120) 
      } else {
        const d = depths.get(node.id) || 0
        y = d * 350 
        
        const siblings = depthGroups.get(d) || []
        const siblingIndex = siblings.findIndex(n => n.id === node.id)
        const totalSiblings = siblings.length
        
        const spacing = 1000 
        const startX = 450 - ((totalSiblings - 1) * spacing) / 2
        x = startX + siblingIndex * spacing
      }

      const background = isTheorem ? '#fff7ed' : node.type === 'proposition' ? '#ffffff' : '#f8fafc'
      const borderColor = isTheorem ? '#f97316' : node.type === 'proposition' ? '#4D96FF' : '#6BCB77'

      // ハイライト情報に基づく透明度と枠線強調の適用
      const { isHighlighted, isTargetSelf } = getHighlightInfo(node.id)
      const opacity = isHighlighted ? 1 : 0.15
      const extraBorder = isTargetSelf ? '3px solid #1e293b' : `2px solid ${borderColor}`

      return {
        id: node.id,
        type: 'custom',
        position: { x, y },
        data: {
          style: {
            background,
            borderColor,
            borderWidth: isTargetSelf ? '3px' : '2px',
            borderStyle: 'solid',
            borderLeft: `6px solid ${borderColor}`,
            borderRadius: '10px',
            color: '#1e293b',
            boxShadow: isTargetSelf ? '0 0 15px rgba(59, 130, 246, 0.5)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
            width: 280,
            textAlign: 'left',
            padding: '12px',
            zIndex: isTheorem ? 1 : 10,
            opacity,
            cursor: 'pointer',
          },
          content: (
            <div style={styles.nodeContent}>
              <div style={styles.nodeHeader}>
                <span style={isTheorem ? styles.theoremBadge : node.type === 'proposition' ? styles.propositionBadge : styles.inferenceBadge}>
                  {isTheorem ? '定義・定理' : node.type === 'proposition' ? '命題' : '推論'}
                </span>
                <span style={styles.nodeId}>{node.id}</span>
              </div>
              <div style={styles.nodeLabel}>{node.label}</div>
            </div>
          ),
        },
      }
    })
  }, [rawNodes, depths, theoremTargets, selectedMode, selectedNodeId, selectedEdgeId])

  // エッジデータ生成（色分け＆ハイライトロジック）
  const flowEdges = useMemo<Edge[]>(() => {
    let bypassCounter = 0

    return rawEdges.map((edge, index) => {
      const safeFrom = edge?.from?.trim() || ''
      const safeTo = edge?.to?.trim() || ''
      const edgeId = `e-${safeFrom}-${safeTo}-${index}`

      const fromNode = rawNodes.find(n => n.id?.trim() === safeFrom)
      const toNode = rawNodes.find(n => n.id?.trim() === safeTo)

      const sourceLabel = formatLabel(fromNode?.label || safeFrom)
      const targetLabel = formatLabel(toNode?.label || safeTo)

      const fromDepth = depths.get(safeFrom) || 0
      const toDepth = depths.get(safeTo) || 0
      const isJump = Math.abs(toDepth - fromDepth) > 1

      const isToTheorem = toNode?.type === 'theorem'
      const isFromTheorem = fromNode?.type === 'theorem'
      const isReference = isToTheorem || isFromTheorem

      let sourceHandle = 'bottom'
      let targetHandle = 'top'
      let isBypass = false
      let jumpIndex = 0

      if (isToTheorem) {
        sourceHandle = 'right-source'
        targetHandle = 'left-target'
      } else if (isFromTheorem) {
        sourceHandle = 'left-source'
        targetHandle = 'right-target'
      } else if (isJump) {
        sourceHandle = 'left-source'
        targetHandle = 'left-target'
        isBypass = true
        jumpIndex = bypassCounter++
      }

      // --- 💡 色分け・ハイライトのリアルタイム計算 ---
      let edgeColor = isReference ? '#f97316' : '#475569'
      let badgeColor = '#3b82f6'
      let edgeOpacity = 0.6
      let strokeWidth = 2

      if (selectedMode === 'none') {
        // 未選択時は通常表示
        edgeOpacity = 0.6
        strokeWidth = 2
      } else if (selectedMode === 'node' && selectedNodeId) {
        if (safeFrom === selectedNodeId) {
          // 🔵 【出るエッジ】青色に強調！
          edgeColor = '#2563eb'
          badgeColor = '#2563eb'
          edgeOpacity = 1
          strokeWidth = 4
        } else if (safeTo === selectedNodeId) {
          // 🔴 【入るエッジ】赤色に強調！
          edgeColor = '#ef4444'
          badgeColor = '#ef4444'
          edgeOpacity = 1
          strokeWidth = 4
        } else {
          // 関係のないエッジは薄暗く
          edgeOpacity = 0.1
          strokeWidth = 1
        }
      } else if (selectedMode === 'edge' && selectedEdgeId) {
        if (edgeId === selectedEdgeId) {
          // 選択されたタグのエッジを強調
          edgeColor = '#2563eb'
          badgeColor = '#2563eb'
          edgeOpacity = 1
          strokeWidth = 4
        } else {
          edgeOpacity = 0.1
          strokeWidth = 1
        }
      }

      return {
        id: edgeId,
        source: safeFrom,
        target: safeTo,
        sourceHandle,
        targetHandle,
        type: 'customEdge',
        animated: selectedMode !== 'none' && edgeOpacity === 1, // ハイライト中の線をアニメーション強調
        data: {
          jumpIndex,
          isBypass,
          sourceLabel,
          targetLabel,
          isReference,
          edgeColor,
          badgeColor,
          edgeOpacity,
          strokeWidth,
          onTagClick: (clickedEdgeId: string) => {
            if (selectedMode === 'edge' && selectedEdgeId === clickedEdgeId) {
              // 同じタグを再度クリックで解除
              setSelectedMode('none')
              setSelectedEdgeId(null)
            } else {
              setSelectedMode('edge')
              setSelectedEdgeId(clickedEdgeId)
              setSelectedNodeId(null)
            }
          },
        },
        style: { stroke: edgeColor, strokeWidth, opacity: edgeOpacity, strokeDasharray: isReference ? '6 6' : undefined },
        markerEnd: isReference ? undefined : { type: MarkerType.ArrowClosed, color: edgeColor },
      }
    })
  }, [rawEdges, rawNodes, depths, selectedMode, selectedNodeId, selectedEdgeId])

  // ノードクリック時のイベントハンドラ
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (selectedMode === 'node' && selectedNodeId === node.id) {
      // 同じノードを再度クリックで解除
      setSelectedMode('none')
      setSelectedNodeId(null)
    } else {
      setSelectedMode('node')
      setSelectedNodeId(node.id)
      setSelectedEdgeId(null)
    }
  }

  // キャンバス（背景）クリックで全選択解除
  const handlePaneClick = () => {
    setSelectedMode('none')
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }

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
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
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
}