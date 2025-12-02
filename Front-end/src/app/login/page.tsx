'use client'
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../../utils/styles/global.css";
import { H1, Button, TextBox, PageLayout, AlertBox, SecondaryLink } from '@/components';
import { useForm } from '@/hooks';



interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { signIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const { values, handleChange, handleSubmit, isSubmitting } = useForm<LoginForm>({
    initialValues: {
      email: "",
      password: ""
    },
    onSubmit: async (formValues) => {
      setError("");

      try {
        await signIn(formValues.email, formValues.password);
        router.push("/home");
      } catch (error: any) {
        setError(error.message || "Login failed");
      }
    },
    validate: (values) => {
      const errors: Partial<Record<keyof LoginForm, string>> = {};
      if (!values.email) errors.email = 'Email is required';
      if (!values.password) errors.password = 'Password is required';
      return errors;
    }
  });

  return (
    <PageLayout maxWidth="sm">
      <H1 text="Login" />


        <form onSubmit={handleSubmit}>
          {error && (
            <AlertBox type="error" className="mb-4">
              {error}
            </AlertBox>
          )}
          
          <TextBox
            label="Email"
            type="email"
            name="email"
            id="email"
            value={values.email}
            onChange={handleChange}
            required
          />


          {/* password */}
          <TextBox
            label="Password"
            type="password"
            name="password"
            id="password"
            value={values.password}
            onChange={handleChange}
            required
            showPasswordToggle
          />

          {/* Large prominent login button */}

          <Button htmlType="submit" type="primary" className="w-full mb-4" disabled={isSubmitting || authLoading}>
            {isSubmitting || authLoading ? "Logging in..." : "Log in"}
          </Button>

        </form>

        {/* Secondary sign up link */}
        <SecondaryLink
          promptText="Don't have an account?"
          linkText="Sign up"
          href="/sign-up"
        />
    </PageLayout>
  );
}