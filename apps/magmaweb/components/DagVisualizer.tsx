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
    // 命題と定理が何個目かをカウントして、ジグザグに配置するための変数
    let propCount = 0;
    let theoremCount = 0;

    return rawNodes.map((node, index) => {
      const isProposition = node.type === 'proposition'
      const isTheorem = node.type === 'theorem'
      
      // 💡 線の貫通を防ぐ「ジグザグ配置（カスケードレイアウト）」
      let x = 350 // 推論(inference)は中央(350)を定位置にする
      
      if (isProposition) {
        // 命題は左寄り(100)と少し中央寄り(200)を交互に配置して被りを防ぐ
        x = propCount % 2 === 0 ? 100 : 200;
        propCount++;
      } else if (isTheorem) {
        // 定理は右端(750)の空きスペースに配置し、線が被らないようにする
        x = 750 + (theoremCount % 2) * 50; 
        theoremCount++;
      }
      
      // 💡 縦の距離(Y)を広めに取ることで、線が迂回するための「道」を作る
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
        type: 'default',
        position: { x, y },
        // 💡 線の出入り口を明示して迂回しやすくする
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
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
          zIndex: isTheorem ? 1 : 10, // 定理ノードは裏側に回して線を邪魔しにくくする
        },
      }
    })
  }, [rawNodes])

  // --- 💡 React Flow 用のエッジデータ変換 ---
  const flowEdges = useMemo<Edge[]>(() => {
    return rawEdges.map((edge, index) => {
      return {
        id: `e-${edge.from}-${edge.to}-${index}`,
        source: edge.from,
        target: edge.to,
        type: 'smoothstep', // 直角に曲がる線
        animated: true,
        style: { 
          stroke: '#94a3b8', 
          strokeWidth: 2, 
          opacity: 0.5 // 💡 半透明を強めにして、万が一重なっても下の文字を読めるように
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
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