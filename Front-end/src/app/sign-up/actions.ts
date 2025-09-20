'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('display_name') as string

  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password
  })

  if (error) {
    console.error('Signup error:', error.message)
    redirect('/error')
  }

  // Insert/update the user's display_name in the users table
  if (data.user && displayName) {
    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        display_name: displayName,
        email: data.user.email
      })

    if (updateError) {
      console.error('Error updating display name in users table:', updateError.message)
    }
  }

  redirect('/welcome') // After successful sign-up
}
