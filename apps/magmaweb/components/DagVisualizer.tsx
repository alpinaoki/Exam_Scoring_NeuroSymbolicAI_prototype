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

export default function DagVisualizer({ graphData }: DagVisualizerProps) {
  const { nodes: rawNodes, edges: rawEdges } = graphData

  // --- 💡 React Flow 用のノードデータ変換 ---
  const flowNodes = useMemo<Node[]>(() => {
    return rawNodes.map((node, index) => {
      const isProposition = node.type === 'proposition'
      const isTheorem = node.type === 'theorem'
      
      let x = 360
      if (isProposition) {
        x = 120 + (index % 2) * 40
      } else if (isTheorem) {
        x = 580 // 定理ノードはさらに右に寄せて線のスペースを確保
      }
      
      // 💡 縦の距離を 110 -> 140 に広げ、線が迂回するスペースを作りました
      const y = index * 140

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
        type: 'default',
        position: { x, y },
        data: {
          label: (
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
        style: {
          background: background,
          borderColor: borderColor,
          borderWidth: '2px',
          borderLeft: `6px solid ${borderColor}`,
          borderRadius: '10px',
          color: '#1e293b',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          width: 300,
          textAlign: 'left' as const,
          padding: '12px',
        },
      }
    })
  }, [rawNodes])

  // --- 💡 React Flow 用のエッジ（矢印の線）データ変換 ---
  const flowEdges = useMemo<Edge[]>(() => {
    return rawEdges.map((edge, index) => {
      return {
        id: `e-${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep', // 💡 斜め線ではなく、直角に曲がる回路図のような線に変更
        animated: true,
        style: { 
          stroke: '#64748b',   // 💡 少し濃いグレーに変更
          strokeWidth: 2.5,    // 💡 少し太くして見やすく
          opacity: 0.65        // 💡 重なっても下の文字や線が透けて見えるように半透明化
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#64748b',
        },
      }
    })
  }, [rawEdges])

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>論理構造 DAG モニター (React Flow 版)</h3>
      <div style={styles.canvasWrapper}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#cbd5e1" gap={16} size={1} />
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => n.style?.borderColor as string} 
            nodeColor={(n) => n.style?.background as string} 
          />
        </ReactFlow>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: '#334155',
    marginBottom: '12px',
    marginTop: 0,
  },
  canvasWrapper: {
    width: '100%',
    height: '680px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden' as const,
  },
  nodeContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propositionBadge: {
    fontSize: '10px',
    fontWeight: 'bold' as const,
    color: '#4D96FF',
    backgroundColor: '#edf4ff',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  inferenceBadge: {
    fontSize: '10px',
    fontWeight: 'bold' as const,
    color: '#6BCB77',
    backgroundColor: '#eefaf0',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  theoremBadge: {
    fontSize: '10px',
    fontWeight: 'bold' as const,
    color: '#ea580c',
    backgroundColor: '#ffedd5',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  nodeId: {
    fontSize: '10px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  nodeLabel: {
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'Consolas, Monaco, monospace',
    wordBreak: 'break-all' as const,
    lineHeight: 1.4,
  },
}