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

                [抽出ルール]
                1. グラフの基本構造（【絶対遵守】厳密な交互配置）:
                   - メインの論理フローは、必ず「命題」→「推論」→「命題」→「推論」と厳密に交互に繋がるように配置してください。
                   - 【重要】命題ノード同士、または推論ノード同士が直接繋がることは絶対に禁止します。答案上で数式が連続して書かれている場合でも、必ずその間に「[推測] 式を整理する」「[推測] 次の条件を考慮する」「[推測] 同類項をまとめる」などの推論ノードを補完して挟んでください。
                2. 命題（proposition）ノード:
                   - 答案に書かれている数式、条件、結論のみを正確に抽出してください。
                   - 「よって」「ゆえに」といった日本語テキストは含めないでください。
                   - ルート、大なりイコールなどはLaTeXコマンドを使わず、「√」「≧」「≦」「≠」「±」などの環境依存しない文字記号を直接使用してください。
                3. 推論（inference）ノードと定理（theorem）ノードの分離と【抽出漏れチェック】:
                   - メインの推論ノード: 生徒が次の命題を導くための論理・計算を具体的に言語化します（例: 「右辺の式を簡略化し、展開する」）。
                   - 定理の分岐ノード: 推論や命題において定理や公式が使われた場合、メインのノードから枝分かれする形で新しいノード（type: "theorem"）を作成し、labelに「定理名：数式・定義の内容」を記述してください。
                   - 【絶対遵守：定理の複数回利用時の独立と明記】同じ定理が2回以上使われた場合、以前の定理ノードに線を戻さず、必ず毎回【新しい定理ノード（type: theorem）】を作成し、labelの末尾に「（2回目の利用）」のように回数を明記してください。
                   - 【見落とし厳禁の自己チェック機構】: 抽出処理の最後に、画像内のすべての数式を必ず再確認（ダブルチェック）してください。特に「Σ（シグマ）の公式」「二次方程式の解の公式」「展開・因数分解の公式」などの重要な定義・定理が使われているにも関わらず、定理ノードが作られていないという「抽出漏れ」が絶対に起きないように網羅してください。1つの変形で複数の公式を使った場合は、複数の定理ノードを枝分かれさせて構いません。
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
                      { "id": "i2", "label": "[推測] 自然数の和の公式を利用し、右辺の式を簡略化して展開する", "type": "inference", "applied_theorem": "自然数の和の公式", "is_in_library": false },
                      { "id": "t1", "label": "自然数の和の公式: Σ_{k=1}^{n} k = n(n+1)/2", "type": "theorem" },
                      { "id": "p4", "label": "S = n(n+1)/2", "type": "proposition" },
                      { "id": "i3", "label": "再度、右辺の式を展開する", "type": "inference", "applied_theorem": "自然数の和の公式", "is_in_library": false },
                      { "id": "t2", "label": "自然数の和の公式: Σ_{k=1}^{n} k = n(n+1)/2 (2回目の利用)", "type": "theorem" },
                      { "id": "p5", "label": "S = n^2/2 + n/2", "type": "proposition" }
                    ],
                    "edges": [
                      { "from": "p1", "to": "i1" },
                      { "from": "p2", "to": "i1" },
                      { "from": "i1", "to": "p3" },
                      { "from": "p3", "to": "i2" },
                      { "from": "i2", "to": "t1" },
                      { "from": "i2", "to": "p4" },
                      { "from": "p4", "to": "i3" },
                      { "from": "i3", "to": "t2" },
                      { "from": "i3", "to": "p5" }
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