// lib/auth.ts
import { supabase } from './supabase'

function usernameToEmail(username: string) {
  return `${username}@magmathe.com`
}

function emailToHandle(email: string) {
  return email.split('@')[0]
}

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

  // 🔽 profiles を明示的に作成
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      username: email,               // ★ NOT NULL 対応
      handle: emailToHandle(email),  // ★ 表示用
    })

  if (profileError) {
    throw profileError
  }
}
