'use client'

import { signup } from "./actions";
import "../../utils/styles/global.css";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { H1 } from "@/components";

export default function SignUpPage() {
  // State for password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for show/hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Derived state - automatically recalculates when password or confirmPassword changes
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';
  const showError = confirmPassword !== '' && !passwordsMatch;

  const activeButtonClass =
    "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200";
  const secondaryButtonClass =
    "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200";
  const disabledButtonClass =
    "bg-gray-400 text-gray-200 rounded px-4 py-2 cursor-not-allowed";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Don't submit if passwords don't match
    if (!passwordsMatch) {
      return;
    }

    // Create FormData and call server action
    const formData = new FormData(e.currentTarget);
    await signup(formData);
  };

  return (
    <div className="page-dark">
      <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
        <H1 text="Sign Up"/>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="display_name">Choose a Display Name</label>
            <input
              id="display_name"
              type="text"
              name="display_name"
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginTop: "0.25rem",
              }}
              className="text-black"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginTop: "0.25rem",
              }}
              className="text-black"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  paddingRight: "4rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  marginTop: "0.25rem",
                }}
                className="text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.875rem",
                  color: "#16a34a",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="confirm_password">Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  paddingRight: "4rem",
                  borderRadius: "4px",
                  border: showError ? "1px solid #dc2626" : "1px solid #ccc",
                  marginTop: "0.25rem",
                }}
                className="text-black"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.875rem",
                  color: "#16a34a",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            {showError && (
              <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                Passwords do not match
              </p>
            )}
          </div>

          {/* Submit */}
          <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <button
              type="submit"
              disabled={!passwordsMatch}
              className={passwordsMatch ? activeButtonClass : disabledButtonClass}
              style={{ width: "100%", padding: "0.5rem" }}
            >
              Create Account
            </button>
          </div>
        </form>
        
        {/* Secondary sign up link */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-400 hover:text-green-300 underline transition-colors duration-200"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}