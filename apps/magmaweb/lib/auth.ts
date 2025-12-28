// lib/auth.ts
import { supabase } from './supabase'

function usernameToEmail(username: string) {
  return `${username}@magmathe.local`
}

export async function signUp(username: string, password: string) {
  const email = usernameToEmail(username)

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
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
