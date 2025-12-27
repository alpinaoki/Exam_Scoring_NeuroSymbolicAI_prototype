import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadAnswerImage(
  file: File,
  problemId: string
) {
  const filePath = ${problemId}/${Date.now()}.png

  const { error } = await supabase.storage
    .from('answers')
    .upload(filePath, file)

  if (error) throw error

  return filePath
}