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

/**
 * 問題（thread root）を1件取得（投稿者handle付き）
 */
export async function getProblemById(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      user_id,
      created_at,
      profiles (
        handle
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * 解答一覧を取得（投稿者handle付き）
 */
export async function getAnswersByProblemId(problemId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      user_id,
      created_at,
      profiles (
        handle
      )
    `)
    .eq('parent_id', problemId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * 問題に紐づく解答数を取得
 */
export async function getAnswerCount(problemId: string) {
  const { count, error } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', problemId)

  if (error) throw error
  return count ?? 0
}

/**
 * 自分の問題投稿一覧
 */
export async function getMyProblems() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      created_at,
      profiles (
        handle
      )
    `)
    .eq('user_id', auth.user.id)
    .eq('type', 'problem')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * 自分の解答一覧
 */
export async function getMyAnswers() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      parent_id,
      created_at,
      profiles (
        handle
      )
    `)
    .eq('user_id', auth.user.id)
    .eq('type', 'answer')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProblemsByHandle(handle: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ① handle → user_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('handle', handle)
    .single()

  if (profileError) throw profileError

  // ② user_id → posts
  const { data, error } = await supabase
    .from('posts')
    .select('id, image_url, created_at')
    .eq('user_id', profile.user_id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}