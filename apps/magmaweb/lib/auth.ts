// lib/auth.ts
import { supabase } from './supabase'

function usernameToEmail(username: string) {
  return `${username}@magmathe.com`
}

export async function signUp(username: string, password: string) {
  const email = usernameToEmail(username)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  // ⚠️ signUp 直後は user が null の場合がある
  if (!data.user) {
    // この場合は「仮成功」扱い（メール認証待ち）
    return
  }

  const user = data.user

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      username: username,
      handle: username,
    })

  if (profileError) {
    throw profileError
  }
}

export async function signIn(username: string, password: string) {
  const email = usernameToEmail(username)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
