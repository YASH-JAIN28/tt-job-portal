import { useState } from "react";

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegistering = mode === "register";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/auth/${isRegistering ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      localStorage.setItem("ttjobportal_token", data.token);
      localStorage.setItem("ttjobportal_user", JSON.stringify(data.user));
      onAuthenticated(data.user);
    } catch (error) {
      setMessage(error.message || "Unable to reach the authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card bg-white p-4 p-md-5">
        <p className="auth-brand text-uppercase mb-3">TT Job Portal</p>
        <h1 className="h2 fw-bold mb-2">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-muted mb-4">
          {isRegistering
            ? "Save your profile and start finding better-fit roles."
            : "Sign in to continue to your job dashboard."}
        </p>

        <div
          className="btn-group w-100 mb-4"
          role="group"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            className={`btn ${!isRegistering ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`btn ${isRegistering ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="mb-3">
              <label className="form-label" htmlFor="auth-name">
                Full name
              </label>
              <input
                id="auth-name"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label" htmlFor="auth-email">
              Email address
            </label>
            <input
              id="auth-email"
              className="form-control"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="form-control"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength="6"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
            />
          </div>
          {message && (
            <div className="alert alert-danger py-2" role="alert">
              {message}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Auth;
