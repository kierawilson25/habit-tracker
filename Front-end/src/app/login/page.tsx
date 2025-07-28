'use client'
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../../utils/styles/global.css";

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200";
  const secondaryButtonClass = "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await signIn(email, password);
      router.push("/"); // Navigate back to home page
    } catch (error: any) {
      setError(error.message || "Login failed");
    }
  };

  return (
    <div className="page-dark min-h-screen">
      <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
        <h1 className="text-4xl md:text-6xl font-bold text-green-600 text-center mb-8 pb-4">
          Login
        </h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* email */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email" className="text-white">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem" }}
              className="text-black"
            />
          </div>
          
          {/* password */}
          <div style={{ marginBottom: "1rem" }}>
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
          
          {/* buttons */}
          <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", flex: 1, padding: "0.5rem" }}
              className={activeButtonClass}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
            
            <Link href="/sign-up" passHref legacyBehavior>
              <button
                type="button"
                style={{ width: "100%", flex: 1, padding: "0.5rem" }}
                className={secondaryButtonClass}
              >
                Sign up
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}