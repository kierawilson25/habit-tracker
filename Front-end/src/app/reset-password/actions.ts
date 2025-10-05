'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/reset-password?error=passwords_dont_match')
  }

  // Validate password length
  if (password.length < 6) {
    redirect('/reset-password?error=password_too_short')
  }

  const { error } = await supabase.auth.updateUser({ 
    password 
  })

  if (error) {
    console.error('Password reset error:', error.message)
    redirect('/reset-password?error=update_failed')
  }

  redirect('/login?message=password_reset_success')
}