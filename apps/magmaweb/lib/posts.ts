// lib/posts.ts
'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * 問題投稿（＋ボタン用）
 */
export async function createPost({
  imageUrl,
}: {
  imageUrl: string
}) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) throw new Error('Not authenticated')

  const { data: inserted, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      type: 'problem',
      image_url: imageUrl,
      parent_id: null,
      root_id: null,
      label: null,
    })
    .select('id')
    .single()

  if (error) throw error

  // root_id を自分自身にする
  await supabase
    .from('posts')
    .update({ root_id: inserted.id })
    .eq('id', inserted.id)
}

/**
 * 解答投稿（💬用）
 */
export async function createAnswer({
  imageUrl,
  problemId,
  rootId,
}: {
  imageUrl: string
  problemId: string
  rootId: string
}) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    type: 'answer',
    image_url: imageUrl,
    parent_id: problemId,
    root_id: rootId,
    label: null,
  })

  if (error) throw error
}
