import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const answerId = searchParams.get('answerId')

  if (!answerId) {
    return NextResponse.json({ error: 'Missing answerId (フロントからのIDが空です)' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data: answer, error } = await supabase
    .from('posts')
    .select('image_url')
    .eq('id', answerId)
    .single()

  if (error || !answer?.image_url) {
    return NextResponse.json({ 
      error: 'Supabaseから画像URLを取得できませんでした', 
      details: error?.message || '画像URLが空です' 
    }, { status: 404 })
  }

  try {
    const imageRes = await fetch(answer.image_url)
    const arrayBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            {
              text: `
                数学の答案画像を解析し、生徒の思考プロセスを「命題」と「推論（変形ルール）」に最小ステップで分解し、以下の構造のJSONのみで返してください。他の挨拶やMarkdownの枠（\`\`\`json等）は一切含めないでください。

                {
                  "nodes": [
                    { "id": "n1", "label": "数式や命題のテキスト(LaTeX表記)", "type": "proposition" },
                    { "id": "t1", "label": "適用した定理・公式・演算名(例: 因数分解, 移項)", "type": "inference" }
                  ],
                  "edges": [
                    { "from": "n1", "to": "t1" },
                    { "from": "t1", "to": "n2" }
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

    // パースを試みる
    try {
      const cleanText = rawText.replace(/```json|```/g, '').trim()
      const graphData = JSON.parse(cleanText)
      
      return NextResponse.json({
        imageUrl: answer.image_url,
        graph: graphData
      })
    } catch (parseErr) {
      // JSONパースに失敗した場合、生テキストを添えてフロントに200で無理やり返す（画面で見るため）
      return NextResponse.json({
        error: 'Geminiの出力が正しくJSONパースできませんでした',
        rawText: rawText
      })
    }

  } catch (err: any) {
    return NextResponse.json({ 
      error: 'Gemini API自体の呼び出し、または画像fetchで致命的エラーが発生しました', 
      details: err?.message || String(err)
    }, { status: 500 })
  }
}