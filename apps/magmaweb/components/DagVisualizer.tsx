'use client'
// @ts-nocheck

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
  getBezierPath,
} from '@xyflow/react'

import '@xyflow/react/dist/style.css'

// 💡 ここが消えていたので復元しました！
type GraphNode = { id: string; label: string; type: 'proposition' | 'inference' | 'theorem' }
type GraphEdge = { from: string; to: string }
type DagVisualizerProps = { graphData: { nodes: GraphNode[]; edges: GraphEdge[] } }

const summarizeText = (text: string, maxLength: number = 10) => {
  if (!text) return '不明'
  const cleanText = text.replace(/\n/g, ' ')
  return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText
}

const CustomNode = ({ data }: any) => (
  <div style={data.style}>
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
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data,
}: EdgeProps) => {
  const isReference = Boolean(data?.isReference)
  const sourceLabel = String(data?.sourceLabel || '不明')
  const targetLabel = String(data?.targetLabel || '不明')

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  })

  const mainBadgeColor = isReference ? '#f97316' : '#3b82f6'
  const centerIcon = isReference ? '🔗' : '➔'

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            backgroundColor: mainBadgeColor,
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '10px',
            padding: '4px 8px',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 100,
          }}
          className="nodrag nopan"
        >
          {sourceLabel} {centerIcon} {targetLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const nodeTypes = { custom: CustomNode }
const edgeTypes = { customEdge: CustomEdgeWithLabels }

export default function DagVisualizer({ graphData }: DagVisualizerProps) {
  if (!graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.edges)) return <div>エラー</div>

  const { nodes: rawNodes, edges: rawEdges } = graphData

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
        const spacing = 650
        const startX = 450 - ((mainSiblings.length - 1) * spacing) / 2
        const mainX = startX + mainIndex * spacing

        const tCount = theoremCounts.get(targetMainId || '') || 0
        theoremCounts.set(targetMainId || '', tCount + 1)

        x = mainX + 360 
        y = targetDepth * 320 + (tCount * 120)
      } else {
        const d = depths.get(node.id) || 0
        y = d * 320 
        
        const siblings = depthGroups.get(d) || []
        const siblingIndex = siblings.findIndex(n => n.id === node.id)
        const totalSiblings = siblings.length
        
        const spacing = 650 
        const startX = 450 - ((totalSiblings - 1) * spacing) / 2
        x = startX + siblingIndex * spacing
      }

      const background = isTheorem ? '#fff7ed' : node.type === 'proposition' ? '#ffffff' : '#f8fafc'
      const borderColor = isTheorem ? '#f97316' : node.type === 'proposition' ? '#4D96FF' : '#6BCB77'

      return {
        id: node.id,
        type: 'custom',
        position: { x, y },
        data: {
          style: {
            background, borderColor, borderWidth: '2px', borderStyle: 'solid',
            borderLeft: `6px solid ${borderColor}`, borderRadius: '10px',
            color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            width: 280, textAlign: 'left', padding: '12px', zIndex: isTheorem ? 1 : 10,
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
  }, [rawNodes, depths, theoremTargets])

  const flowEdges = useMemo<Edge[]>(() => {
    return rawEdges.map((edge, index) => {
      const safeFrom = edge?.from?.trim() || ''
      const safeTo = edge?.to?.trim() || ''

      const fromNode = rawNodes.find(n => n.id?.trim() === safeFrom)
      const toNode = rawNodes.find(n => n.id?.trim() === safeTo)

      const sourceLabel = summarizeText(fromNode?.label || safeFrom, 10)
      const targetLabel = summarizeText(toNode?.label || safeTo, 10)

      const isToTheorem = toNode?.type === 'theorem'
      const isFromTheorem = fromNode?.type === 'theorem'
      const isReference = isToTheorem || isFromTheorem

      let sourceHandle = 'bottom'
      let targetHandle = 'top'

      if (isToTheorem) {
        sourceHandle = 'right-source'
        targetHandle = 'left-target'
      } else if (isFromTheorem) {
        sourceHandle = 'left-source'
        targetHandle = 'right-target'
      }

      const strokeColor = isReference ? '#f97316' : '#475569'

      return {
        id: `e-${safeFrom}-${safeTo}-${index}`,
        source: safeFrom, target: safeTo,
        sourceHandle, targetHandle, type: 'customEdge',
        animated: !isReference,
        data: { sourceLabel, targetLabel, isReference },
        style: { stroke: strokeColor, strokeWidth: 2, opacity: 0.6, strokeDasharray: isReference ? '6 6' : undefined },
        markerEnd: isReference ? undefined : { type: MarkerType.ArrowClosed, color: strokeColor },
      }
    })
  }, [rawEdges, rawNodes])

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>論理構造 DAG モニター</h3>
      <div style={styles.canvasWrapper}>
        <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView attributionPosition="bottom-right">
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