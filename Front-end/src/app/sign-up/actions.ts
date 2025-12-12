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

  // Insert the user's data in the users table (legacy)
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
    }

    // Create user profile record
    const username = displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        username: username || `user_${data.user.id.substring(0, 8)}`,
        bio: null,
        habits_privacy: 'public',
        profile_picture_url: null
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      console.error('Error details:', JSON.stringify(profileError, null, 2))
    }
  }

  redirect('/welcome')
}