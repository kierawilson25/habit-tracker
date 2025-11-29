'use client'
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../../utils/styles/global.css";
import { H1, Button, TextBox, PageLayout, AlertBox, SecondaryLink } from '@/components';



export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await signIn(email, password);
      router.push("/home"); // Navigate back to home page
    } catch (error: any) {
      setError(error.message || "Login failed");
    }
  };

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
                    
          
          {/* password */}
          <TextBox
            label="Password"
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            showPasswordToggle
          />
          
          {/* Large prominent login button */}

          <Button htmlType="submit" type="primary" className="w-full mb-4">
            {loading ? "Logging in..." : "Log in"}
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