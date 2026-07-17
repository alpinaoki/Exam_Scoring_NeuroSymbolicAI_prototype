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
  type: 'proposition' | 'inference' | 'theorem' // 💡 'theorem' (定義・定理) を型に追加
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
      // 💡 ノードの種類を3パターンに判定
      const isProposition = node.type === 'proposition'
      const isTheorem = node.type === 'theorem'
      
      // --- 💡 枝分かれが綺麗に見えるように配置(X座標)を計算 ---
      // 命題は左側、推論は中央、定義・定理は右側に配置して視認性を最大化します
      let x = 360
      if (isProposition) {
        x = 120 + (index % 2) * 40
      } else if (isTheorem) {
        x = 560 // 💡 定理ノードは右側に散らして枝分かれ感を強調
      }
      
      const y = index * 110 // 各ステップが被らないように縦の距離を確保

      // --- 💡 ノードの種類に応じたカラーデザインの決定 ---
      let background = '#f8fafc'
      let borderColor = '#6BCB77' // 標準（推論）は緑
      if (isProposition) {
        background = '#ffffff'
        borderColor = '#4D96FF' // 命題は青
      } else if (isTheorem) {
        background = '#fff7ed' // 💡 定理は超薄いオレンジ
        borderColor = '#f97316' // 💡 定理の枠線は鮮やかなオレンジ
      }

      return {
        id: node.id,
        type: 'default',
        position: { x, y },
        data: {
          label: (
            <div style={styles.nodeContent}>
              <div style={styles.nodeHeader}>
                {/* 💡 ノードの種類に応じて3つのバッジを出し分け */}
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
          borderLeft: `6px solid ${borderColor}`, // 左側のアクセント太線
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
  // 💡 定理ノード用のオレンジ色のバッジスタイルを追加
  theoremBadge: {
    fontSize: '10px',
    fontWeight: 'bold' as const,
    color: '#ea580c',      // 濃いオレンジ
    backgroundColor: '#ffedd5', // 薄いオレンジ
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