'use client'

import { signup } from "./actions";
import "../../utils/styles/global.css";
import Link from "next/link";
import { useState, FormEvent } from "react";
import { H1, TextBox, Button } from "@/components";

export default function SignUpPage() {
  // State for form fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Derived state - automatically recalculates when password or confirmPassword changes
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';
  const showError = confirmPassword !== '' && !passwordsMatch;

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
          {/* Display Name */}
          <TextBox
            label="Choose a Display Name"
            type="text"
            name="display_name"
            id="display_name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          {/* Email */}
          <TextBox
            label="Email"
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
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

          {/* Confirm Password */}
          <TextBox
            label="Confirm Password"
            type="password"
            name="confirm_password"
            id="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            showPasswordToggle
            error={showError}
            errorMessage="Passwords do not match"
          />

          {/* Submit */}
          <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <Button
              htmlType="submit"
              type="primary"
              disabled={!passwordsMatch}
              fullWidth
            >
              Create Account
            </Button>
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