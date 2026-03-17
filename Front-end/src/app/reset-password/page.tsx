'use client'

import { resetPassword } from "./actions";
import "../../utils/styles/global.css";
import { use } from "react";
import { H1, Button, TextBox, PageLayout, AlertBox, SecondaryLink } from "@/components";
import { useForm } from "@/hooks";

interface ResetPasswordForm {
  password: string;
  confirm_password: string;
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = use(searchParams);

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm<ResetPasswordForm>({
    initialValues: {
      password: '',
      confirm_password: ''
    },
    onSubmit: async (formValues) => {
      const formData = new FormData();
      formData.append('password', formValues.password);
      formData.append('confirm_password', formValues.confirm_password);
      await resetPassword(formData);
    },
    validate: (values) => {
      const errors: Partial<Record<keyof ResetPasswordForm, string>> = {};
      if (!values.password) errors.password = 'Password is required';
      if (values.password && values.password.length < 6) errors.password = 'Password must be at least 6 characters long';
      if (!values.confirm_password) errors.confirm_password = 'Please confirm your password';
      if (values.password && values.confirm_password && values.password !== values.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
      return errors;
    }
  });

  const passwordsMatch = values.password === values.confirm_password && values.confirm_password !== '';
  const showConfirmError = values.confirm_password !== '' && !passwordsMatch;

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'passwords_dont_match':
        return 'Passwords do not match. Please try again.';
      case 'password_too_short':
        return 'Password must be at least 6 characters long.';
      case 'update_failed':
        return 'Failed to reset password. The link may have expired.';
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage(params.error);

  return (
    <PageLayout maxWidth="sm">
      <H1 text="Reset Password" />

      {errorMessage && (
        <AlertBox type="error" className="mb-4">
          {errorMessage}
        </AlertBox>
      )}

      <form onSubmit={handleSubmit}>
        <TextBox
          label="New Password"
          type="password"
          name="password"
          id="password"
          value={values.password}
          onChange={handleChange}
          required
          showPasswordToggle
          error={!!errors.password}
          errorMessage={errors.password}
        />

        <TextBox
          label="Confirm New Password"
          type="password"
          name="confirm_password"
          id="confirm_password"
          value={values.confirm_password}
          onChange={handleChange}
          required
          showPasswordToggle
          error={showConfirmError || !!errors.confirm_password}
          errorMessage={errors.confirm_password || "Passwords do not match"}
        />

        <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
          <Button
            htmlType="submit"
            type="primary"
            disabled={!passwordsMatch || isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </form>

      <SecondaryLink
        promptText="Remember your password?"
        linkText="Log in"
        href="/login"
      />
    </PageLayout>
  );
}
