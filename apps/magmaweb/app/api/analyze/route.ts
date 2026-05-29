import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
// 既に完璧に動いている外部クライアントを直接マウント
import { supabase } from '../../../lib/supabase'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const answerId = searchParams.get('answerId')

  if (!answerId) {
    return NextResponse.json({ error: 'Missing answerId (パラメータが空です)' }, { status: 400 })
  }

  // すでに確立されているクライアントからそのままpostsテーブルを叩く
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

  try {
    const imageRes = await fetch(answer.image_url)
    const arrayBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    const response = await ai.models.generateContent({
      // 💡 'models/gemini-1.5-pro' からプレフィックスを除去した最新モデルに変更
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
                入力された数学の答案画像を解析し、生徒の思考プロセスを「命題（数式や条件）」と「推論（変形ルールや適用した定理）」からなる有向グラフとして最小ステップで抽出し、指定されたJSONフォーマットのみで出力してください。

                [抽出ルール]
                1. グラフの基本構造:
                   - 「命題（proposition）」ノードと「推論（inference）」ノードが原則として交互に繋がるように配置してください。
                2. 命題（proposition）ノード（純粋な数式の抽出）:
                   - 答案に書かれている数式、条件、結論のみを正確に抽出してください。
                   - 「よって」「ゆえに」「〜を代入すると」といった日本語のテキストは命題ノードには一切含めないでください。
                   - 数式は基本的にテキストフォーマットとしますが、視認性を高めるため、ルート、大なりイコール、ノットイコールなどはLaTeXコマンド（\sqrt, \geq, \neqなど）を使わず、必ず「√」「≧」「≦」「≠」「±」などの環境依存しない文字記号を直接使用してください（例：\sqrt{5} ではなく √5）。
                   - 乗算・除算記号も適宜「×」「÷」を使用して構いませんが、分数は「a/b」のようにスラッシュで表現してください。
                3. 推論（inference）ノード（日本語の吸収と言語化）:
                   - 生徒が次の命題を導くために「どのような論理・計算・公式を用いたか」を簡潔に言語化してください。
                   - 答案に書かれている「①を②に代入して」「条件より」などの日本語テキストは、この推論ノードのラベルとして吸収・要約してください。
                4. 複数の式の合流（連立方程式など）の扱い:
                   - 複数の命題（数式）を組み合わせて新しい命題を導いている場合、それらの複数の「命題ノード」から、1つの「推論ノード」に向かってエッジを繋げてください。（例：式Aと式Bから、推論「辺々を足す」を経て、式Cが導かれる構造）
                5. 論理の飛躍と暗算の補完（重要）:
                   - 途中式が省略されており論理や計算の飛躍がある場合は、その間を埋める推測される操作や公式を明記してください。
                   - 推測した推論ラベルの先頭には必ず「[推測]」と付けてください。（例：「[推測] 展開して整理」）
                6. 忠実性の原則:
                   - 生徒が答案に明記した「誤った数式」自体を正しい数式に修正・補正することは厳禁です。誤った数式はそのまま「命題」ノードとして抽出してください。

                [出力フォーマット（厳守）]
                - 以下のJSONスキーマに厳密に従って出力してください。
                - 挨拶、説明、Markdownのコードブロック（\`\`\`json など）などの余分なテキストは一切含めず、パース可能な生のJSON文字列のみを返してください。
                {
                  "nodes": [
                    { "id": "p1", "label": "x = 1 - √5", "type": "proposition" },
                    { "id": "i1", "label": "-1を移項する", "type": "inference" },
                    { "id": "p2", "label": "x - 1 = -√5", "type": "proposition" },
                    { "id": "i2", "label": "両辺を2乗する", "type": "inference" },
                    { "id": "p3", "label": "x^2 - 2x + 1 = 5", "type": "proposition" }
                  ],
                  "edges": [
                    { "from": "p1", "to": "i1" },
                    { "from": "i1", "to": "p2" },
                    { "from": "p2", "to": "i2" },
                    { "from": "i2", "to": "p3" }
                  ]
                }
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
      // 1. 前後の空白や、万が一混入したマークアップをトリミング
      let cleanText = rawText.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim()
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim()
      }

      // 2. 特殊な改行コードやエスケープの乱れをパース前に最小限にケア
      const graphData = JSON.parse(cleanText)
      
      return NextResponse.json({
        imageUrl: answer.image_url,
        graph: graphData
      })
    } catch (parseErr) {
      // パースに失敗した場合、文字列の不正なエスケープを強制置換してリトライするセーフティネット
      try {
        const fixedText = rawText
          .replace(/\\/g, '\\\\') // バックスラッシュをエスケープ
          .replace(/\\\\"|\\\\'|\\\\n/g, (match) => match.substring(2)) // 必要な制御文字は戻す
        const graphData = JSON.parse(fixedText)
        return NextResponse.json({
          imageUrl: answer.image_url,
          graph: graphData
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
