import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '../../../lib/supabase'
import theorems from '../../../lib/constants/theorems.json';

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
    if (data?.theorems?.rule_groups) {
      theoremListString = data.theorems.rule_groups
        .flatMap((g: any) => g.rules || [])
        .map((r: any) => `- ${r.name}`)
        .join('\n');
    } else if (data?.rule_groups) {
      theoremListString = data.rule_groups
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

                // （※route.ts の該当部分のみ抜粋）
                [抽出ルール]
                1. グラフの基本構造（厳密な交互配置と例外規定）:
                   - メインの論理フローは、原則として「命題」→「推論」→「命題」→「推論」と交互に配置してください。
                   - 命題同士が連続する場合は、必ず間に「[推測] 式を整理する」などの推論ノードを補完してください。
                2. 命題（proposition）ノード:
                   - 答案の数式や条件を正確に抽出してください。
                3. 推論（inference）ノードと定義・定理（theorem）ノードの接続ルール:
                   - 【基本原則】定義・定理ノード（type: "theorem"）は、原則としてそれを適用した「推論ノード」から枝分かれさせて接続してください。
                   - 【特例ルール（命題からの直接接続）】推論の内容が公式変換に直接関係ない場合や、命題の数式自体が定義・定理に直接依存している場合は、「命題ノード」から直接「定義・定理ノード」へエッジを接続して出力することを強く推奨します。
                     (例: 命題「S = Σk」があり、次の推論が単なる「式を整理する」である場合、推論にΣの公式が明記されていないため、推論ではなく命題「S = Σk」から直接定理「Σの公式」へエッジを引いてください。)
                   - 【分岐（並行展開）の明示】1つの命題から2つ以上の推論に分岐する場合は、それぞれの推論ラベルの先頭に「[場合分け1]」「[条件A]」などのプレフィックスをつけてください。
                   - 同じ定理が複数回使われた場合は、毎回新しい定理ノードを作成し、末尾に「(2回目の利用)」と記載してください。
                4. 複数の式の合流（連立方程式など）の扱い:
                   - 複数の命題（数式）を組み合わせて新しい命題を導いている場合、それらの複数の「命題ノード」から、1つの「推論ノード」に向かってエッジを繋げてください。
                5. グラフや表の除外:
                   - 関数グラフ、幾何的な図形、増減表などは解析の対象外とします。
                6. 忠実性の原則:
                   - 誤った数式はそのまま「命題」ノードとして抽出してください。

                [出力フォーマット（厳守）]
                - 以下のJSONスキーマに厳密に従って出力してください。
                - 挨拶、説明、Markdownのコードブロックなどの余分なテキストは一切含めず、パース可能な生のJSON文字列のみを返してください。
                  
                {
                  "graph": {
                    "nodes": [
                      { "id": "p1", "label": "x = 1 - √5", "type": "proposition" },
                      { "id": "p2", "label": "y = 2", "type": "proposition" },
                      { "id": "i1", "label": "xとyの値を式に代入する", "type": "inference" },
                      { "id": "p3", "label": "x + y = 3 - √5", "type": "proposition" },
                      { "id": "p4", "label": "S = Σ_{k=1}^{n} k", "type": "proposition" },
                      { "id": "t1", "label": "総和記号(Σ)の定義: 数列の和を簡易的に表す記号", "type": "theorem" },
                      { "id": "i2", "label": "[推測] 自然数の和の公式を利用し、右辺の式を簡略化して展開する", "type": "inference", "applied_theorem": "自然数の和の公式", "is_in_library": false },
                      { "id": "t2", "label": "自然数の和の公式: Σ_{k=1}^{n} k = n(n+1)/2", "type": "theorem" },
                      { "id": "p5", "label": "S = n(n+1)/2", "type": "proposition" }
                    ],
                    "edges": [
                      { "from": "p1", "to": "i1" },
                      { "from": "p2", "to": "i1" },
                      { "from": "i1", "to": "p3" },
                      { "from": "p4", "to": "t1" }, 
                      { "from": "p4", "to": "i2" },
                      { "from": "i2", "to": "t2" },
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

      const parsedData = JSON.parse(cleanText)
      return NextResponse.json({ 
        imageUrl: answer.image_url, 
        graph: parsedData.graph, 
        newTheorems: parsedData.new_theorems 
      })
    } catch (parseErr) {
      try {
        const fixedText = rawText.replace(/\\/g, '\\\\').replace(/\\\\"|\\\\'|\\\\n/g, (match) => match.substring(2))
        const parsedData = JSON.parse(fixedText)
        return NextResponse.json({ 
          imageUrl: answer.image_url, 
          graph: parsedData.graph, 
          newTheorems: parsedData.new_theorems 
        })
      } catch (innerErr) {
        return NextResponse.json({ error: 'Geminiの出力データがJSONとして不適正です', rawText: rawText })
      }
    }

  } catch (err: any) {
    return NextResponse.json({ error: 'APIリクエストで致命的エラーが発生しました', details: err?.message || String(err) }, { status: 500 })
  }
}