import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/admin.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await loginAdmin(form);
      login(response);
      navigate("/admin/dashboard");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-flat flex min-h-screen items-center justify-center bg-[#171717] px-3 py-6 sm:px-6 sm:py-12">
      <div className="panel w-full max-w-md p-5 shadow-glow sm:rounded-[2.5rem] sm:p-8">
        <p className="font-display text-[11px] uppercase tracking-[0.2em] text-[#f9bf1a] sm:text-sm sm:tracking-[0.5em]">Admin Login</p>
        <h1 className="mt-3 font-display text-3xl uppercase tracking-[0.02em] text-white sm:mt-4 sm:text-5xl sm:tracking-[0.08em]">Coast Control</h1>
        <p className="mt-3 text-sm leading-6 text-white/60 sm:mt-4 sm:text-base">Admin-only access for vehicle data, product catalog, and quote management.</p>

        {error ? <div className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:mt-8">
          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
          />
          <Field
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#f9bf1a] px-6 py-3 font-medium text-black transition hover:opacity-85 disabled:opacity-60 sm:rounded-full"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-center text-xs uppercase tracking-[0.25em] text-white/45 transition hover:text-[#f9bf1a]">
          ← Return to website
        </Link>
      </div>
    </div>
  );
}

const Field = ({ label, name, type, value, onChange, autoComplete }) => (
  <label className="block">
    <span className="mb-2 block text-xs uppercase tracking-[0.15em] text-white/55 sm:text-sm sm:tracking-[0.25em]">{label}</span>
    <input
      required
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full border border-white/10 bg-black/40 px-4 py-3 text-base text-white outline-none transition focus:border-[#f9bf1a] sm:rounded-2xl"
    />
  </label>
);
