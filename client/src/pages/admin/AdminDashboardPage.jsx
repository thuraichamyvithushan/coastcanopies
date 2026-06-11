import { useEffect, useState } from "react";
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
