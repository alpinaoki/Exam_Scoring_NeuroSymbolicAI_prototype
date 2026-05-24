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

// React Flowの標準スタイルシートをインポート
import '@xyflow/react/dist/style.css'

type GraphNode = {
  id: string
  label: string
  type: 'proposition' | 'inference'
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
    // 完全に重なるのを防ぐため、インデックスに応じて初期配置のXYを簡易計算
    return rawNodes.map((node, index) => {
      const isProposition = node.type === 'proposition'
      
      // 命題ノードと推論ノードを視覚的に少し左右に散らし、上から順に並べる
      const x = isProposition ? 120 + (index % 2) * 40 : 360
      const y = index * 110 // 各ステップが被らないように縦の距離を確保

      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div style={styles.nodeContent}>
              <div style={styles.nodeHeader}>
                <span style={isProposition ? styles.propositionBadge : styles.inferenceBadge}>
                  {isProposition ? '命題' : '推論'}
                </span>
                <span style={styles.nodeId}>{node.id}</span>
              </div>
              <div style={styles.nodeLabel}>{node.label}</div>
            </div>
          ),
        },
        style: {
          background: isProposition ? '#ffffff' : '#f8fafc',
          borderColor: isProposition ? '#4D96FF' : '#6BCB77',
          borderWidth: '2px',
          borderLeft: isProposition ? '6px solid #4D96FF' : '6px solid #6BCB77',
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
        animated: true, // 動くアニメーション線にして論理の流れを可視化
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed, // 閉じられた綺麗な矢印
          color: '#94a3b8',
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
          {/* 背景のドットグリッドパターン */}
          <Background color="#cbd5e1" gap={16} size={1} />
          {/* 左下の拡大・縮小・リセット用コントローラー */}
          <Controls />
          {/* 右下のナビゲーション用ミニマップ */}
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
    height: '680px', // 複雑な長い数式グラフを動かすのに最適な作業領域の高さ
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