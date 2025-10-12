'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('display_name') as string

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        display_name: displayName // Store in auth.users metadata as backup
      }
    }
  })

  if (error) {
    console.error('Signup error:', error.message)
    redirect('/error?from=signup')
  }

  // Wait a moment for auth user to be fully created
  await new Promise(resolve => setTimeout(resolve, 500))

  // Insert the user's data in the users table
  if (data.user) {
    console.log('User signed up:', data.user)
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        display_name: displayName,
        email: data.user.email,
        profile_picture: null
      })

    if (insertError) {
      console.error('Error inserting into users table:', insertError)
      console.error('Error details:', JSON.stringify(insertError, null, 2))
      // Don't redirect on this error - user is signed up, just missing profile
    }
  }

  redirect('/welcome')
}