'use client'
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../../utils/styles/global.css";
import { H1 } from '@/components/H1';
import Button from "@/components/Button";
import TextBox from '@/components/TextBox';


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
    <div className="page-dark min-h-screen">
      <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>

        <H1 text="Login" />


        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
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
          <div style={{ marginBottom: "2rem" }}>
            <label htmlFor="password" className="text-white">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
              className="text-black"
            />
          </div>
          
          {/* Large prominent login button */}

          <Button htmlType="submit" type="primary" className="w-full mb-4">
            {loading ? "Logging in..." : "Log in"}
          </Button>

        </form>

        {/* Secondary sign up link */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link 
              href="/sign-up" 
              className="text-green-400 hover:text-green-300 underline transition-colors duration-200"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}