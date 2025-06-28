import { login, signup } from "./actions";

export default function LoginPage() {
  const activeButtonClass =
    "bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition-colors duration-200";

  return (
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

            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <label htmlFor="email">Password</label>
        <input
          type="password"
          id="password"
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
        <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
          <button
            style={{ flex: 1, padding: "0.5rem" }}
            className={activeButtonClass}
            formAction={login}
          >
            Log in
          </button>
          <button
            style={{ flex: 1, padding: "0.5rem" }}
            className={activeButtonClass}
            formAction={signup}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
