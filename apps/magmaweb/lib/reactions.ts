'use client'

import { supabase } from './supabase'

export async function createReaction({
  postId,
  type,
  comment,
  x = 0.5,
  y = 0.5,
}: {
  postId: string
  type: 'star' | 'question' | 'exclamation'
  comment: string
  x?: number
  y?: number
}) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('reactions').insert({
    post_id: postId,
    user_id: user.id,
    type,
    comment,
    x_float: x,
    y_float: y,
  })

  if (error) throw error
}
