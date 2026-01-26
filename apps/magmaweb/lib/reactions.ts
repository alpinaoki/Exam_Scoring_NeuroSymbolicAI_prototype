'use client'

import { supabase } from './supabase'

export async function createReaction({
  postId,
  type,
  comment,
}: {
  postId: string
  type: 'star' | 'question' | 'exclamation'
  comment: string
}) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('reactions').insert({
    post_id: postId,
    user_id: user.id,
    type,
    comment,
    x_float: 0.5,
    y_float: 0.5,
  })

  if (error) throw error
}
