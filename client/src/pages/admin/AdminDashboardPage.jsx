import { useEffect, useState } from "react";
import { fetchProducts, fetchQuotes, fetchVehicles, seedProductCoordinates } from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { StatsGrid } from "../../components/admin/StatsGrid.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminDashboardPage() {
  const { auth } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");
  const [state, setState] = useState({
    vehicles: [],
    products: [],
    quotes: [],
    error: "",
    loading: true
  });

  const handleAutoSetCoordinates = async () => {
    try {
      setSeeding(true);
      setSeedMessage("");
      const res = await seedProductCoordinates(auth.token);
      setSeedMessage(res.message);
    } catch (err) {
      setSeedMessage(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

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

  const quoteValue = state.quotes.reduce((sum, quote) => sum + quote.totalPrice, 0);

  return (
    <AdminLayout
      title="Dashboard"
      description="A single overview of your vehicles, catalog items, and incoming quote value."
    >
      {state.error ? <div className="rounded-3xl bg-red-500/10 p-5 text-red-200">{state.error}</div> : null}
      {state.loading ? (
        <div className="panel rounded-[2rem] p-8 text-white/60">Loading dashboard...</div>
      ) : (
        <>
          <StatsGrid
            stats={[
              {
                label: "Vehicles",
                value: state.vehicles.length,
                caption: "Available public vehicle platforms."
              },
              {
                label: "Products",
                value: state.products.length,
                caption: "Canopies, modules, and accessories in the builder."
              },
              {
                label: "Quotes",
                value: state.quotes.length,
                caption: "Inbound quote requests captured so far."
              },
              {
                label: "Pipeline",
                value: formatCurrency(quoteValue),
                caption: "Indicative total quote value based on current submissions."
              }
            ]}
          />

          {/* Quick Auto-Align Action Banner */}
          <div className="mt-6 rounded-3xl border border-[#f9bf1a]/30 bg-[linear-gradient(90deg,rgba(249,191,26,0.1),rgba(0,0,0,0.4))] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl uppercase tracking-[0.06em] text-[#f9bf1a]">
                  ⚡ Auto-Set All 3D Product Coordinates
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  Automatically set standard 3D scale, position, rotation, and 6-vehicle compatibility JSON across all products in the database with 1 click.
                </p>
              </div>
              <button
                type="button"
                disabled={seeding}
                onClick={handleAutoSetCoordinates}
                className="rounded-full bg-[#f9bf1a] px-6 py-3 font-semibold uppercase tracking-wider text-black transition hover:bg-[#ffd04a] disabled:opacity-60"
              >
                {seeding ? "Updating Database..." : "Auto-Align All Products"}
              </button>
            </div>
            {seedMessage ? (
              <p className="mt-3 font-mono text-xs text-emerald-300">{seedMessage}</p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="panel rounded-[2rem] p-6">
              <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Recent Quotes</h2>
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
                      {quote.vehicle.name} + {quote.baseSystem.name}
                    </p>
                    <p className="mt-2 font-display text-2xl uppercase tracking-[0.05em] text-[#f9bf1a]">
                      {formatCurrency(quote.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel rounded-[2rem] p-6">
              <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Catalog Mix</h2>
              <div className="mt-6 space-y-4">
                {["canopy", "module", "accessory"].map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <span className="uppercase tracking-[0.25em] text-white/55">{type}</span>
                    <span className="font-display text-3xl uppercase tracking-[0.06em] text-[#f9bf1a]">
                      {state.products.filter((product) => product.type === type).length}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
