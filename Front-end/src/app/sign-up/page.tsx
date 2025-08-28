import { signup } from "./actions";
import "../../utils/styles/global.css"; // Import global styles
import Link from "next/link";

export default function SignUpPage() {
  const activeButtonClass =
    "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200";
  const secondaryButtonClass =
    "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200";

  return (
    <div className="page-dark">
      <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
        <h1 className="text-4xl md:text-6xl font-bold text-green-600 text-center mb-8 pb-4">
          Sign Up
        </h1>

        <form action={signup}>
          {/* Username */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="username">Choose a username</label>
            <input
              type="username"
              name="username"
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
            <input
              type="password"
              name="password"
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

          {/* Submit */}
          <div style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
            <button
              type="submit"
              className={activeButtonClass}
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
