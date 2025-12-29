'use client'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createPost({
  type,
  imageUrl,
  parentId,
}: {
  type: 'problem' | 'answer'
  imageUrl?: string
  parentId?: string | null
}) {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    type,
    image_url: imageUrl ?? null,
    parent_id: parentId ?? null,
  })

  if (error) {
    throw error
  }
}
