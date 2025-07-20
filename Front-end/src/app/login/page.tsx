import { login } from "./actions";
import Link from "next/link";
import "../../utils/styles/global.css"; // Import global styles

export default function LoginPage() {
  const activeButtonClass = "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200"
  const secondaryButtonClass = "border-2 border-green-600 text-green-600 rounded px-4 py-2 hover:bg-green-600 hover:text-white transition-colors duration-200"

  return (
    <div className="page-dark min-h-screen">
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem" }}>
      <h1 className="text-4xl md:text-6xl font-bold text-green-600 text-center mb-8 pb-4">
        Login
      </h1>

      <form>
        {/* email */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            required
            style={{ width: "100%", padding: "0.5rem" } }
            className="text-black"
          />
        </div>
        {/* password */}
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password" 
          id="password"
          required
          style={{ width: "100%", padding: "0.5rem" }}
          className="text-black"
        />
        {/* login */}
        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
          <button
            style={{ width: "100%",flex: 1, padding: "0.5rem" }}
            className={activeButtonClass}
            formAction={login}
          >
            Log in
          </button>
          {/* sign up */}
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