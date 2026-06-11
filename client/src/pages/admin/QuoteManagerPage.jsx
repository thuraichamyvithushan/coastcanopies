import { useEffect, useState } from "react";
import { fetchQuotes, updateQuoteStatus } from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatCurrency } from "../../utils/currency.js";

const statuses = ["new", "reviewed", "quoted", "closed"];

export default function QuoteManagerPage() {
  const { auth } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadQuotes = async () => {
    try {
      setQuotes(await fetchQuotes(auth.token));
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [auth.token]);

  const handleStatusChange = async (quoteId, status) => {
    try {
      setError("");
      setMessage("");
      await updateQuoteStatus(auth.token, quoteId, status);
      setMessage("Quote status updated.");
      loadQuotes();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  return (
    <AdminLayout
      title="Quote Manager"
      description="Review inbound quote requests, inspect build selections, and move each lead through your sales pipeline."
    >
      {message ? <div className="mb-6 rounded-3xl bg-emerald-500/10 p-5 text-emerald-200">{message}</div> : null}
      {error ? <div className="mb-6 rounded-3xl bg-red-500/10 p-5 text-red-200">{error}</div> : null}

      <div className="space-y-5">
        {quotes.map((quote) => (
          <article key={quote._id} className="panel rounded-[2rem] p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="font-display text-sm uppercase tracking-[0.45em] text-[#f9bf1a]">Quote #{quote._id.slice(-6)}</p>
                <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.08em] text-white">
                  {quote.customerInfo.name}
                </h2>
                <p className="mt-2 text-white/60">
                  {quote.customerInfo.email} • {quote.customerInfo.phone}
                </p>
                <p className="mt-2 text-white/45">{quote.customerInfo.address}</p>
              </div>

              <div className="min-w-[240px]">
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Status</p>
                <select
                  value={quote.status}
                  onChange={(event) => handleStatusChange(quote._id, event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Vehicle</p>
                <p className="mt-2 text-lg text-white">{quote.vehicle.name}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Base System</p>
                <p className="mt-2 text-lg text-white">{quote.baseSystem.name}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Total</p>
                <p className="mt-2 font-display text-3xl uppercase tracking-[0.06em] text-[#f9bf1a]">
                  {formatCurrency(quote.totalPrice)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Modules</p>
                <p className="mt-2 text-white/70">
                  {quote.modules.length ? quote.modules.map((item) => item.name).join(", ") : "None selected"}
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm uppercase tracking-[0.25em] text-white/50">Accessories</p>
                <p className="mt-2 text-white/70">
                  {quote.accessories.length
                    ? quote.accessories.map((item) => item.name).join(", ")
                    : "None selected"}
                </p>
              </div>
            </div>

            {quote.customerInfo.notes ? (
              <div className="mt-6 rounded-3xl border border-white/10 bg-black/35 p-4 text-white/65">
                {quote.customerInfo.notes}
              </div>
            ) : null}
          </article>
        ))}

        {!quotes.length ? <div className="panel rounded-[2rem] p-8 text-white/60">No quotes yet.</div> : null}
      </div>
    </AdminLayout>
  );
}
