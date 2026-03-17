'use client'

import { use } from 'react'
import { requestPasswordReset } from './actions'
import '../../utils/styles/global.css'
import { H1, Button, TextBox, PageLayout, AlertBox, SecondaryLink } from '@/components'
import { useForm } from '@/hooks'

interface ForgotPasswordForm {
  email: string
}

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const params = use(searchParams)

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm<ForgotPasswordForm>({
    initialValues: { email: '' },
    onSubmit: async (formValues) => {
      const formData = new FormData()
      formData.append('email', formValues.email)
      await requestPasswordReset(formData)
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ForgotPasswordForm, string>> = {}
      if (!values.email) errors.email = 'Email is required'
      return errors
    },
  })

  if (params.sent === 'true') {
    return (
      <PageLayout maxWidth="sm">
        <H1 text="Check Your Inbox" />
        <AlertBox type="success" className="mb-4">
          If an account exists for that email, you'll receive a reset link shortly.
        </AlertBox>
        <SecondaryLink
          promptText="Remember your password?"
          linkText="Log in"
          href="/login"
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout maxWidth="sm">
      <H1 text="Forgot Password" />

      {params.error === 'link_expired' && (
        <AlertBox type="error" className="mb-4">
          That reset link has expired. Please request a new one.
        </AlertBox>
      )}

      <form onSubmit={handleSubmit}>
        <TextBox
          label="Email"
          type="email"
          name="email"
          id="email"
          value={values.email}
          onChange={handleChange}
          required
          error={!!errors.email}
          errorMessage={errors.email}
        />

        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <Button htmlType="submit" type="primary" disabled={isSubmitting} fullWidth>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </div>
      </form>

      <SecondaryLink
        promptText="Remember your password?"
        linkText="Log in"
        href="/login"
      />
    </PageLayout>
  )
}
