'use client'

import { resetPassword } from "./actions";
import "../../utils/styles/global.css";
import Link from "next/link";
import { useState, FormEvent, use } from "react";
import { H1, Button, PageLayout, SecondaryLink } from "@/components";


export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  // Unwrap searchParams
  const params = use(searchParams);
  
  // State for password fields
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for show/hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Derived state - automatically recalculates when password or confirmPassword changes
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';
  const showError = confirmPassword !== '' && !passwordsMatch;

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Don't submit if passwords don't match
    if (!passwordsMatch) {
      return;
    }

    // Create FormData and call server action
    const formData = new FormData(e.currentTarget);
    await resetPassword(formData);
  };

  return (
    <PageLayout maxWidth="sm">
      <H1 text="Reset Password" />


        {errorMessage && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #dc2626",
            borderRadius: "4px",
            padding: "0.75rem",
            marginBottom: "1rem"
          }}>
            <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">New Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            <label htmlFor="confirm_password">Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
            <Button
              htmlType="submit"
              type="primary"
              disabled={!passwordsMatch}
              fullWidth
            >
              Reset Password
            </Button>
          </div>
        </form>
        
        {/* Secondary link */}
        <SecondaryLink
          promptText="Remember your password?"
          linkText="Log in"
          href="/login"
        />
    </PageLayout>
  );
}