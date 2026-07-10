import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '../../../lib/supabase'
import theorems from '../../../lib/constants/theorems.json'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const answerId = searchParams.get('answerId')

  if (!answerId) {
    return NextResponse.json({ error: 'Missing answerId (パラメータが空です)' }, { status: 400 })
  }

  const { data: answer, error } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', answerId)
    .single()

  if (error || !answer?.image_url) {
    return NextResponse.json({
      error: 'Supabaseから画像URLを取得できませんでした',
      details: error?.message || '該当する答案データに画像URLがありません。'
    }, { status: 404 })
  }

  let theoremListString = "";
  const data: any = theorems;
 
  try {
    // 修正版のJSON構造（ルートに version と rule_groups がある状態）に完全対応
    if (data?.rule_groups) {
      theoremListString = data.rule_groups
        .flatMap((g: any) => g.rules || [])
        .map((r: any) => `- ${r.name}`)
        .join('\n');
    } else if (data?.theorems?.rule_groups) {
      theoremListString = data.theorems.rule_groups
        .flatMap((g: any) => g.rules || [])
        .map((r: any) => `- ${r.name}`)
        .join('\n');
    } else if (Array.isArray(data)) {
      theoremListString = data.map((r: any) => `- ${r.name}`).join('\n');
    }
  } catch (err) {
    console.error("定理データの展開に失敗しましたが、空のまま続行します", err);
  }
 
  try {
    const imageRes = await fetch(answer.image_url)
    const arrayBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            {
text: `
                [役割]
                あなたは数学教育の専門家であり、論理構造解析に特化したAIアシスタントです。

                [目的]
                入力された数学の答案画像を解析し、生徒の思考プロセスを「命題（数式や条件）」と「推論（変形ルールや適用した定理）」からなる有向グラフとして最小ステップで抽出します。さらに、使用された定理が既存のライブラリに存在するか判定し、指定されたJSONフォーマットのみで出力してください。

                [抽出ルール]
                1. グラフの基本構造:
                   - 「命題（proposition）」ノードと「推論（inference）」ノードが原則として交互に繋がるように配置してください。
                2. 命題（proposition）ノード（純粋な数式の抽出と視認性の確保）:
                   - 答案に書かれている数式、条件、結論のみを正確に抽出してください。
                   - 「よって」「ゆえに」「〜を代入すると」といった日本語のテキストは命題ノードには一切含めないでください。
                   - 数式は基本的にテキストフォーマットとしますが、視認性を高めるため、ルート、大なりイコール、ノットイコールなどはLaTeXコマンド（\\sqrt, \\geq, \\neqなど）を使わず、必ず「√」「≧」「≦」「≠」「±」などの環境依存しない文字記号を直接使用してください（例：\\sqrt{5} ではなく √5）。
                   - 乗算・除算記号も適宜「×」「÷」を使用して構いませんが、分数は「a/b」のようにスラッシュで表現してください。
                3. 推論（inference）ノードと定理の判定（具体的な操作説明の維持）:
                   - 生徒が次の命題を導くための論理・計算を具体的に言語化してください。「〜の公式を利用」といった記述だけで終わらせず、「右辺の式を簡略化し、展開する」「両辺を2乗して移項する」など、具体的な式変形の操作内容を必ずラベルに含めてください。
                   - 答案に書かれている「①を②に代入して」などの日本語テキストもここに吸収します。
                   - 【重要】生徒が答案に定理や公式の名前を明記していなくても、数式の変形過程から公式・定理が使われたことが明らかな場合は、具体的な操作内容の記述に加えて、その公式の利用も推測して特定してください。
                   - 定理や公式が使われたと判断した場合、プロンプト末尾の [利用可能な定理ライブラリ] と照合してください。
                   - ライブラリに存在する場合は、ノードに "applied_theorem": "定理名" と "is_in_library": true を追加してください。
                   - ライブラリに存在しない公式・定理が使われていると判断した場合は、"applied_theorem": "定理名" と "is_in_library": false を追加してください。単なる四則演算や移項には適用しないでください。
                4. 複数の式の合流（連立方程式など）の扱い:
                   - 複数の命題（数式）を組み合わせて新しい命題を導いている場合、それらの複数の「命題ノード」から、1つの「推論ノード」に向かってエッジを繋げてください。
                5. 論理の飛躍と暗算の補完:
                   - 途中式が省略されており論理や計算の飛躍がある場合は、その間を埋める操作を明記し、ラベルの先頭に「[推測]」と付けてください。（例：「[推測] シグマの公式を利用し、右辺の式を簡略化して展開する」）
                6. グラフや表の除外（ノイズ処理）:
                   - 解答用紙に描かれている関数グラフ、幾何的な図形、増減表などの表は解析の対象外とします。ノードとして抽出しないでください。
                7. 忠実性の原則:
                   - 生徒が答案に明記した「誤った数式」自体を正しい数式に修正・補正することは厳禁です。誤った数式はそのまま「命題」ノードとして抽出してください。

                [出力フォーマット（厳守）]
                - 以下のJSONスキーマに厳密に従って出力してください。
                - 挨拶、説明、Markdownのコードブロックなどの余分なテキストは一切含めず、パース可能な生のJSON文字列のみを返してください。
                - "new_theorems" 配列には、"is_in_library": false となった定理のみを、以下のキー構造に従って生成してください。追加がない場合は空配列 [] にしてください。
                  - "id": 任意のユニークなID (例: "rule_...")
                  - "name": 定理やルールの名前
                  - "level": 適用される学習段階の推測 (["elementary", "middle", "high"]のいずれか1つ以上の配列)
                  - "before": 変形前の一般的な式
                  - "after": 変形後の一般的な式
                  - "conditions": 変形が成り立つ条件の配列
                  
                {
                  "graph": {
                    "nodes": [
                      { "id": "p1", "label": "x = 1 - √5", "type": "proposition" },
                      { "id": "p2", "label": "y = 2", "type": "proposition" },
                      { "id": "i1", "label": "xとyの値を式に代入する", "type": "inference" },
                      { "id": "p3", "label": "x + y = 3 - √5", "type": "proposition" },
                      { "id": "p4", "label": "Σ_{k=1}^{n} k", "type": "proposition" },
                      { "id": "i2", "label": "[推測] シグマの公式を利用し、右辺の式を簡略化して展開する", "type": "inference", "applied_theorem": "自然数の和の公式", "is_in_library": false },
                      { "id": "p5", "label": "n(n+1)/2", "type": "proposition" }
                    ],
                    "edges": [
                      { "from": "p1", "to": "i1" },
                      { "from": "p2", "to": "i1" },
                      { "from": "i1", "to": "p3" },
                      { "from": "p4", "to": "i2" },
                      { "from": "i2", "to": "p5" }
                    ]
                  },
                  "new_theorems": [
                    {
                      "id": "rule_sigma_k",
                      "name": "自然数の和の公式",
                      "level": ["high"],
                      "before": "Σ_{k=1}^{n} k",
                      "after": "n(n+1)/2",
                      "conditions": ["n is a positive integer"]
                    }
                  ]
                }
                
                [利用可能な定理ライブラリ]
                ${theoremListString}
              `
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.0
      }
    })

    const rawText = response.text

    try {
      let cleanText = rawText.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim()
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim()
      }

      const graphData = JSON.parse(cleanText)
     
      return NextResponse.json({
        imageUrl: answer.image_url,
        graph: graphData.graph // フロントの期待値 { graph: { nodes, edges } } に整合
      })
    } catch (parseErr) {
      try {
        const fixedText = rawText
          .replace(/\\/g, '\\\\')
          .replace(/\\\\"|\\\\'|\\\\n/g, (match) => match.substring(2))
        const graphData = JSON.parse(fixedText)
        return NextResponse.json({
          imageUrl: answer.image_url,
          graph: graphData.graph
        })
      } catch (innerErr) {
        return NextResponse.json({
          error: 'Geminiの出力データがJSONとして不適正です',
          rawText: rawText
        })
      }
    }

  } catch (err: any) {
    return NextResponse.json({
      error: 'Gemini APIへのリクエスト、または画像取得で致命的エラーが発生しました',
      details: err?.message || String(err)
    }, { status: 500 })
  }
}
