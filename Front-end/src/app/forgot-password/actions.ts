'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
  const redirectTo = `${origin}/auth/callback?next=/reset-password`

  await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  // Always redirect with sent=true to avoid email enumeration
  redirect('/forgot-password?sent=true')
}
