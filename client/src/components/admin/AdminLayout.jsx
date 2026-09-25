import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  `shrink-0 px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] transition sm:rounded-full sm:px-4 sm:py-2 sm:text-sm sm:tracking-[0.25em] ${
    isActive ? "bg-[#f9bf1a] text-black" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
  }`;

export const AdminLayout = ({ title, description, children }) => {
  const { auth, logout } = useAuth();

  return (
    <div className="mobile-flat min-h-screen bg-[#171717] px-3 py-4 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="panel mb-4 p-4 sm:mb-8 sm:rounded-[2rem] sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.2em] text-[#f9bf1a] sm:text-sm sm:tracking-[0.45em]">Admin Console</p>
              <h1 className="mt-2 font-display text-2xl font-semibold uppercase tracking-[0.02em] text-white sm:mt-3 sm:text-5xl sm:font-normal sm:tracking-[0.08em]">{title}</h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-white/60 sm:mt-3 sm:text-base">{description}</p>
            </div>
            <div className="text-xs text-white/60 sm:text-sm">
              <p className="break-all">Signed in as {auth?.admin?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/"
                  className="border border-white/15 px-3 py-2.5 uppercase tracking-[0.1em] text-white transition hover:border-[#f9bf1a] hover:text-[#f9bf1a] sm:rounded-full sm:px-4 sm:py-2 sm:tracking-[0.25em]"
                >
                  View Site
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="border border-white/15 px-3 py-2.5 uppercase tracking-[0.1em] text-white transition hover:border-[#f9bf1a] hover:text-[#f9bf1a] sm:rounded-full sm:px-4 sm:py-2 sm:tracking-[0.25em]"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
          <nav className="-mx-4 mt-5 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-8 sm:flex-wrap sm:gap-3 sm:px-0 sm:pb-0">
            <NavLink to="/admin/dashboard" end className={navLinkClass}>
              Overview
            </NavLink>
            <NavLink to="/admin/dashboard/vehicles" className={navLinkClass}>
              Vehicles
            </NavLink>
            <NavLink to="/admin/dashboard/trays" className={navLinkClass}>
              Trays
            </NavLink>
            <NavLink to="/admin/dashboard/canopies" className={navLinkClass}>
              Canopies
            </NavLink>
            <NavLink to="/admin/dashboard/accessories" className={navLinkClass}>
              Accessories
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
