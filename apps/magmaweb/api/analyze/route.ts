import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const answerId = searchParams.get('answerId')

  console.log('--- [API START] answerId:', answerId)

  if (!answerId) {
    return NextResponse.json({ error: 'Missing answerId' }, { status: 400 })
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
    console.error('--- [Supabase Error] or Image missing:', error)
    return NextResponse.json({ error: 'Answer image not found' }, { status: 404 })
  }

  console.log('--- [Supabase Success] image_url:', answer.image_url)

  try {
    const imageRes = await fetch(answer.image_url)
    const arrayBuffer = await imageRes.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString('base64')

    console.log('--- [Gemini Request] Sending image to Gemini...')

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

    console.log('--- [Gemini Raw Response]:', response.text)

    // ここでパースエラーが起きやすいので安全に処理
    let graphData
    try {
      // 稀に ```json が含まれてしまう場合の防衛策
      const cleanText = response.text.replace(/```json|```/g, '').trim()
      graphData = JSON.parse(cleanText)
    } catch (parseErr) {
      console.error('--- [JSON Parse Failed] Raw text was:', response.text)
      throw new Error('Gemini output was not valid JSON')
    }
    
    console.log('--- [API SUCCESS] Parsed graphData successfully')

    return NextResponse.json({
      imageUrl: answer.image_url,
      graph: graphData
    })

  } catch (err) {
    console.error('--- [Gemini API Error]:', err)
    return NextResponse.json({ error: 'Gemini processing failed' }, { status: 500 })
  }
}