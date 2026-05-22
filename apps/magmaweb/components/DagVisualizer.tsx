'use client'

import React from 'react'
import { ArrowDown, HelpCircle } from 'lucide-react'

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
  const { nodes, edges } = graphData

  // 簡易的にトポロジカルソート順、もしくはID順でノードを縦に並べる
  // 今後の検証フェーズで、エッジの接続関係から正しい階層を計算するロジックに拡張可能
  return (
    <div style={styles.container}>
      <div style={styles.flowList}>
        {nodes.map((node, index) => {
          const isProposition = node.type === 'proposition'
          
          return (
            <div key={node.id} style={styles.nodeWrapper}>
              {/* 各ノードのカード */}
              <div
                style={{
                  ...styles.nodeCard,
                  ...(isProposition ? styles.propositionCard : styles.inferenceCard),
                }}
              >
                <div style={styles.nodeHeader}>
                  <span style={isProposition ? styles.propositionBadge : styles.inferenceBadge}>
                    {isProposition ? '命題' : '推論・適用ルール'}
                  </span>
                  <span style={styles.nodeId}>{node.id}</span>
                </div>
                
                <div style={styles.nodeLabel}>
                  {/* 今後 KaTeX 等を導入した際はここで数式レンダリングを行う */}
                  {node.label}
                </div>
              </div>

              {/* 最後のノード以外で、次のノードへの接続がある場合に矢印を描画 */}
              {index < nodes.length - 1 && (
                <div style={styles.arrowContainer}>
                  <ArrowDown size={18} color="#999" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    padding: '10px 0',
  },
  flowList: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  nodeWrapper: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    width: '100%',
  },
  nodeCard: {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '12px',
    padding: '14px 16px',
    border: '1px solid',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.2s ease',
  },
  propositionCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderLeft: '5px solid #4D96FF', // 命題は青のアクセント
  },
  inferenceCard: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderLeft: '5px solid #6BCB77', // 推論ルールは緑のアクセント
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  propositionBadge: {
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#4D96FF',
    backgroundColor: '#edf4ff',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  inferenceBadge: {
    fontSize: '11px',
    fontWeight: 'bold' as const,
    color: '#6BCB77',
    backgroundColor: '#eefaf0',
    padding: '2px 8px',
    borderRadius: '20px',
  },
  nodeId: {
    fontSize: '11px',
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  nodeLabel: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: 500,
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'Consolas, Monaco, monospace', // LaTeXコードが読みやすいフォント
  },
  arrowContainer: {
    margin: '8px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}