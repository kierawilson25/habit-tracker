'use client'

import { signup } from "./actions";
import "../../utils/styles/global.css";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { H1, TextBox, Button, PageLayout, SecondaryLink } from "@/components";
import { useForm } from "@/hooks";

interface SignUpForm {
  display_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export default function SignUpPage() {
  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm<SignUpForm>({
    initialValues: {
      display_name: '',
      email: '',
      password: '',
      confirm_password: ''
    },
    onSubmit: async (formValues) => {
      // Create FormData for server action
      const formData = new FormData();
      formData.append('display_name', formValues.display_name);
      formData.append('email', formValues.email);
      formData.append('password', formValues.password);
      formData.append('confirm_password', formValues.confirm_password);

      await signup(formData);
    },
    validate: (values) => {
      const errors: Partial<Record<keyof SignUpForm, string>> = {};
      if (!values.display_name) errors.display_name = 'Display name is required';
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      if (!values.confirm_password) errors.confirm_password = 'Please confirm your password';
      if (values.password && values.confirm_password && values.password !== values.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
      return errors;
    }
  });

  // Derived state for UI feedback
  const passwordsMatch = values.password === values.confirm_password && values.confirm_password !== '';
  const showError = values.confirm_password !== '' && !passwordsMatch;

  return (
    <PageLayout maxWidth="sm">
      <H1 text="Sign Up"/>

        <form onSubmit={handleSubmit}>
          {/* Display Name */}
          <TextBox
            label="Choose a Display Name"
            type="text"
            name="display_name"
            id="display_name"
            value={values.display_name}
            onChange={handleChange}
            required
            error={!!errors.display_name}
            errorMessage={errors.display_name}
          />

          {/* Email */}
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

          {/* Password */}
          <TextBox
            label="Password"
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

          {/* Confirm Password */}
          <TextBox
            label="Confirm Password"
            type="password"
            name="confirm_password"
            id="confirm_password"
            value={values.confirm_password}
            onChange={handleChange}
            required
            showPasswordToggle
            error={showError || !!errors.confirm_password}
            errorMessage={errors.confirm_password || "Passwords do not match"}
          />

          {/* Submit */}
          <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <Button
              htmlType="submit"
              type="primary"
              disabled={!passwordsMatch || isSubmitting}
              fullWidth
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>
        
        {/* Secondary sign up link */}
        <SecondaryLink
          promptText="Already have an account?"
          linkText="Log in"
          href="/login"
        />
    </PageLayout>
  );
}