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
                1. グラフの基本構造:
                   - 「命題（proposition）」ノードと「推論（inference）」ノードが原則として交互に繋がるように配置してください（メインの論理フロー）。
                2. 命題（proposition）ノード（純粋な数式の抽出と視認性の確保）:
                   - 答案に書かれている数式、条件、結論のみを正確に抽出してください。
                   - 「よって」「ゆえに」「〜を代入すると」といった日本語のテキストは命題ノードには一切含めないでください。
                   - 数式は基本的にテキストフォーマットとしますが、視認性を高めるため、ルート、大なりイコール、ノットイコールなどはLaTeXコマンドを使わず、必ず「√」「≧」「≦」「≠」「±」などの環境依存しない文字記号を直接使用してください。
                   - 乗算・除算記号も適宜「×」「÷」を使用して構いませんが、分数は「a/b」のようにスラッシュで表現してください。
                3. 推論（inference）ノードと定理（theorem）ノードの分離:
                   - メインの推論ノード: 生徒が次の命題を導くための論理・計算を具体的に言語化してください。「右辺の式を簡略化し、展開する」などの操作内容を記述します。この推論ノードには、定理の数式や定義などの詳細情報は絶対に書かないでください。
                   - 変形に伴う定理の分岐ノード: 推論（変形）において定理や公式が使われた場合、メインの推論ノードから枝分かれする形で新しいノードを作成してください。この分岐ノードの type は「theorem」とし、label に「定理名：数式・定義の内容」を具体的に記述してください。
                   - 命題に伴う定理の分岐ノード: 命題ノードに書かれている数式自体に特定の定義や定理が含まれる場合、その命題ノードから直接枝分かれする形で新しいノードを作成してください（typeは「theorem」）。
                   - 【超重要：定理の複数回利用時の独立と明記】全く同じ定理や定義が解答の途中で2回以上使われた場合でも、以前の定理ノードに線を戻して繋ぐ（再利用する）ことは絶対にしないでください。必ず毎回【新しい定理ノード（type: theorem）】を作成し、labelの末尾に「（2回目の利用）」のように回数を明記してください。例：「分配法則（展開）：(a+b)(c+d)...（2回目の利用）」
                   - 定理や公式が使われたと判断した場合、プロンプト末尾の [利用可能な定理ライブラリ] と照合してください。
                   - ライブラリに存在する場合は、メインの推論ノードに "applied_theorem": "定理名" と "is_in_library": true を追加してください。
                4. 複数の式の合流（連立方程式など）の扱い:
                   - 複数の命題（数式）を組み合わせて新しい命題を導いている場合、それらの複数の「命題ノード」から、1つの「推論ノード」に向かってエッジを繋げてください。
                5. 論理の飛躍と暗算の補完:
                   - 途中式が省略されており論理や計算の飛躍がある場合は、その間を埋める操作を明記し、メイン推論ラベルの先頭に「[推測]」と付けてください。
                6. グラフや表の除外（ノイズ処理）:
                   - 解答用紙に描かれている関数グラフ、幾何的な図形、増減表などの表は解析の対象外とします。
                7. 忠実性の原則:
                   - 誤った数式はそのまま「命題」ノードとして抽出してください。

                [出力フォーマット（厳守）]
                - 以下のJSONスキーマに厳密に従って出力してください。
                - 挨拶、説明、Markdownのコードブロックなどの余分なテキストは一切含めず、パース可能な生のJSON文字列のみを返してください。
                - "new_theorems" 配列には、"is_in_library": false となった定理のみを、以下のキー構造に従って生成してください。追加がない場合は空配列 [] にしてください。
                  
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

      const graphData = JSON.parse(cleanText)
      return NextResponse.json({ imageUrl: answer.image_url, graph: graphData })
    } catch (parseErr) {
      try {
        const fixedText = rawText.replace(/\\/g, '\\\\').replace(/\\\\"|\\\\'|\\\\n/g, (match) => match.substring(2))
        const graphData = JSON.parse(fixedText)
        return NextResponse.json({ imageUrl: answer.image_url, graph: graphData })
      } catch (innerErr) {
        return NextResponse.json({ error: 'Geminiの出力データがJSONとして不適正です', rawText: rawText })
      }
    }

  } catch (err: any) {
    return NextResponse.json({ error: 'APIリクエストで致命的エラーが発生しました', details: err?.message || String(err) }, { status: 500 })
  }
}