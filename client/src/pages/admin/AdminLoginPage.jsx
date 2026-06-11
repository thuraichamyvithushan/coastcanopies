import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="flex min-h-screen items-center justify-center bg-[#171717] px-6 py-12">
      <div className="panel w-full max-w-md rounded-[2.5rem] p-8 shadow-glow">
        <p className="font-display text-sm uppercase tracking-[0.5em] text-[#f9bf1a]">Admin Login</p>
        <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.08em] text-white">Coast Control</h1>
        <p className="mt-4 text-white/60">Admin-only access for vehicle data, product catalog, and quote management.</p>

        {error ? <div className="mt-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            className="w-full rounded-full bg-[#f9bf1a] px-6 py-3 font-medium text-black transition hover:opacity-85 disabled:opacity-60"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, name, type, value, onChange, autoComplete }) => (
  <label className="block">
    <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">{label}</span>
    <input
      required
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
    />
  </label>
);
