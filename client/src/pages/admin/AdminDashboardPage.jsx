import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchQuotes, fetchVehicles } from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { StatsGrid } from "../../components/admin/StatsGrid.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminDashboardPage() {
  const { auth } = useAuth();
  const [state, setState] = useState({
    vehicles: [],
    products: [],
    quotes: [],
    error: "",
    loading: true
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [vehicles, products, quotes] = await Promise.all([
          fetchVehicles(),
          fetchProducts(),
          fetchQuotes(auth.token)
        ]);

        setState({
          vehicles,
          products,
          quotes,
          error: "",
          loading: false
        });
      } catch (error) {
        setState((current) => ({
          ...current,
          error: error.message,
          loading: false
        }));
      }
    };

    load();
  }, [auth.token]);

  const trays = state.products.filter((p) => p.type === "tray");
  const canopies = state.products.filter((p) => p.type === "canopy");
  const accessories = state.products.filter((p) => p.type === "accessory");
  const quoteValue = state.quotes.reduce((sum, quote) => sum + quote.totalPrice, 0);

  const catalogItems = [
    { type: "Vehicles", count: state.vehicles.length, href: "/admin/dashboard/vehicles", caption: "Vehicle platforms" },
    { type: "Trays", count: trays.length, href: "/admin/dashboard/trays", caption: "Tray options" },
    { type: "Canopies", count: canopies.length, href: "/admin/dashboard/canopies", caption: "Canopy options" },
    { type: "Accessories", count: accessories.length, href: "/admin/dashboard/accessories", caption: "Add-on accessories" }
  ];

  return (
    <AdminLayout
      title="Dashboard"
      description="Overview of your vehicle platforms, catalog, and incoming quote pipeline."
    >
      {state.error ? <div className="rounded-3xl bg-red-500/10 p-5 text-red-200">{state.error}</div> : null}
      {state.loading ? (
        <div className="panel rounded-[2rem] p-8 text-white/60">Loading dashboard...</div>
      ) : (
        <>
          {/* Top stats */}
          <StatsGrid
            stats={[
              {
                label: "Vehicles",
                value: state.vehicles.length,
                caption: "Available vehicle platforms."
              },
              {
                label: "Trays",
                value: trays.length,
                caption: "Tray options in the builder."
              },
              {
                label: "Canopies",
                value: canopies.length,
                caption: "Canopy options in the builder."
              },
              {
                label: "Accessories",
                value: accessories.length,
                caption: "Add-on accessories available."
              },
              {
                label: "Quotes",
                value: state.quotes.length,
                caption: "Inbound quote requests."
              },
              {
                label: "Pipeline",
                value: formatCurrency(quoteValue),
                caption: "Total indicative quote value."
              }
            ]}
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Recent Quotes */}
            <section className="panel rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Recent Quotes</h2>
                <Link
                  to="/admin/dashboard/quotes"
                  className="text-xs uppercase tracking-[0.2em] text-[#f9bf1a] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="mt-6 space-y-4">
                {state.quotes.slice(0, 5).map((quote) => (
                  <div
                    key={quote._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/75"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-white">{quote.customerInfo.name}</p>
                      <span className="rounded-full bg-white/5 px-3 py-1 uppercase tracking-[0.25em] text-white/55">
                        {quote.status}
                      </span>
                    </div>
                    <p className="mt-2 text-white/55">
                      {quote.vehicle.name} · {quote.modules.length + quote.accessories.length} selected products
                    </p>
                    <p className="mt-2 font-display text-2xl uppercase tracking-[0.05em] text-[#f9bf1a]">
                      {formatCurrency(quote.totalPrice)}
                    </p>
                  </div>
                ))}
                {!state.quotes.length ? (
                  <p className="text-sm text-white/40">No quotes received yet.</p>
                ) : null}
              </div>
            </section>

            {/* Catalog Quick-links */}
            <section className="panel rounded-[2rem] p-6">
              <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Catalog</h2>
              <p className="mt-1 text-xs text-white/40">Quick links to manage each product category.</p>
              <div className="mt-6 space-y-3">
                {catalogItems.map(({ type, count, href, caption }) => (
                  <Link
                    key={type}
                    to={href}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#f9bf1a]/40 hover:bg-white/[0.06]"
                  >
                    <div>
                      <span className="block uppercase tracking-[0.25em] text-white">{type}</span>
                      <span className="text-xs text-white/40">{caption}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-3xl uppercase tracking-[0.06em] text-[#f9bf1a]">
                        {count}
                      </span>
                      <span className="text-white/30">›</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Builder Flow Overview */}
          <section className="panel mt-6 rounded-[2rem] p-6">
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Builder Flow</h2>
            <p className="mt-1 text-xs text-white/40">The user configuration flow for the public site.</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {[
                { step: "1", label: "Vehicle", href: "/admin/dashboard/vehicles" },
                { step: "2", label: "Tray", href: "/admin/dashboard/trays" },
                { step: "3", label: "Canopy", href: "/admin/dashboard/canopies" },
                { step: "4", label: "Accessories", href: "/admin/dashboard/accessories" },
                { step: "5", label: "Summary & Quote", href: "/admin/dashboard/quotes" }
              ].map(({ step, label, href }, index, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <Link
                    to={href}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-[#f9bf1a]/50 hover:bg-white/[0.06]"
                  >
                    <span className="flex h-7 w-7 items-center justify-center bg-[#f9bf1a] text-xs font-black text-black">
                      {step}
                    </span>
                    <span className="text-sm uppercase tracking-[0.2em] text-white">{label}</span>
                  </Link>
                  {index < arr.length - 1 && (
                    <span className="text-white/20 text-lg">→</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}
