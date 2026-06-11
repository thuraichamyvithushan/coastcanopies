import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm uppercase tracking-[0.25em] transition ${
    isActive ? "bg-[#f9bf1a] text-black" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
  }`;

export const AdminLayout = ({ title, description, children }) => {
  const { auth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#171717] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="panel mb-8 rounded-[2rem] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.45em] text-[#f9bf1a]">Admin Console</p>
              <h1 className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-white">{title}</h1>
              <p className="mt-3 max-w-2xl text-white/60">{description}</p>
            </div>
            <div className="text-sm text-white/60">
              <p>Signed in as {auth?.admin?.email}</p>
              <button
                type="button"
                onClick={logout}
                className="mt-3 rounded-full border border-white/15 px-4 py-2 uppercase tracking-[0.25em] text-white transition hover:border-[#f9bf1a] hover:text-[#f9bf1a]"
              >
                Log Out
              </button>
            </div>
          </div>
          <nav className="mt-8 flex flex-wrap gap-3">
            <NavLink to="/admin/dashboard" end className={navLinkClass}>
              Overview
            </NavLink>
            <NavLink to="/admin/dashboard/vehicles" className={navLinkClass}>
              Vehicles
            </NavLink>
            <NavLink to="/admin/dashboard/products" className={navLinkClass}>
              Products
            </NavLink>
            <NavLink to="/admin/dashboard/quotes" className={navLinkClass}>
              Quotes
            </NavLink>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
};
