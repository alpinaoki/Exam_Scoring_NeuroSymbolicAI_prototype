// lib/auth.ts
import { supabase } from './supabase'

function usernameToEmail(username: string) {
  return `${username}@magmathe.com`
}

function emailToHandle(email: string) {
  return email.split('@')[0]
}

/**
 * サインアップ
 * - auth.users を作成
 * - profiles に必ず1行作る
 */
export async function signUp(username: string, password: string) {
  const email = usernameToEmail(username)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  const user = data.user
  if (!user) {
    throw new Error('ユーザー作成に失敗しました')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      username: email,              // NOT NULL
      handle: emailToHandle(email), // 表示用
    })

  if (profileError) {
    throw profileError
  }
}

/**
 * ログイン
 */
export async function signIn(username: string, password: string) {
  const email = usernameToEmail(username)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
}

/**
 * ログアウト
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * 現在のユーザー取得
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
