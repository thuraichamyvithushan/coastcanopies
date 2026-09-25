import { Fragment, useEffect, useState } from "react";
import { fetchQuotes, updateQuoteStatus } from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatCurrency } from "../../utils/currency.js";

const statuses = ["new", "reviewed", "quoted", "closed"];
const statusColors = {
  new: "border-[#efc400]/30 bg-[#efc400]/10 text-[#f5cf49]",
  reviewed: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  quoted: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  closed: "border-white/15 bg-white/5 text-white/55"
};

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("en-NZ", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";

const getProducts = (quote) => [
  ...(quote.baseSystem?.price ? [quote.baseSystem] : []),
  ...(quote.modules || []),
  ...(quote.accessories || [])
];

export default function QuoteManagerPage() {
  const { auth } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchQuotes(auth.token)
      .then((results) => {
        if (active) setQuotes(results);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [auth.token]);

  const handleStatusChange = async (quoteId, status) => {
    setUpdatingId(quoteId);
    setError("");
    setMessage("");
    try {
      await updateQuoteStatus(auth.token, quoteId, status);
      setQuotes((current) => current.map((quote) => quote._id === quoteId ? { ...quote, status } : quote));
      setMessage("Quote status updated.");
    } catch (statusError) {
      setError(statusError.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const query = search.trim().toLowerCase();
  const filteredQuotes = quotes.filter((quote) => {
    if (statusFilter !== "all" && quote.status !== statusFilter) return false;
    if (!query) return true;
    return [quote._id, quote.customerInfo?.name, quote.customerInfo?.email, quote.vehicle?.name, ...getProducts(quote).map((item) => item.name)]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });

  return (
    <AdminLayout title="Quote Manager" description="Review requests, inspect build details, and update their progress.">
      {message ? <p role="status" className="mb-5 border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm text-emerald-200">{message}</p> : null}
      {error ? <p role="alert" className="mb-5 border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm text-red-200">{error}</p> : null}

      <section className="overflow-hidden border border-white/10 bg-[#1d1d1d]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:gap-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#efc400]">Incoming requests</p>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.02em] text-white sm:text-3xl">All quotes <span className="text-white/35">({quotes.length})</span></h2>
            <p className="mt-1 text-xs text-white/45 sm:mt-2 sm:text-sm">Open a quote to see its contact details and products.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/45">Search quotes</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, vehicle, reference..."
                className="w-full min-w-[230px] border border-white/15 bg-[#111] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#efc400] focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/45">Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full border border-white/15 bg-[#111] px-4 py-2.5 text-sm text-white focus:border-[#efc400] focus:outline-none sm:min-w-[150px]">
                <option value="all">All statuses</option>
                {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="divide-y divide-white/10 lg:hidden">
          {filteredQuotes.map((quote) => {
            const products = getProducts(quote);
            const expanded = expandedId === quote._id;
            return (
              <article key={quote._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-[#efc400]">#{quote._id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1 text-[11px] text-white/40">{formatDate(quote.createdAt)}</p>
                  </div>
                  <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.1em] ${statusColors[quote.status] || statusColors.new}`}>{quote.status}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{quote.customerInfo?.name}</h3>
                <p className="mt-1 text-xs text-white/55">{quote.vehicle?.name} · {products.length} selected products</p>
                <p className="mt-3 text-lg font-semibold text-[#efc400]">{formatCurrency(quote.totalPrice)}</p>
                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <select
                    value={quote.status}
                    disabled={updatingId === quote._id}
                    onChange={(event) => handleStatusChange(quote._id, event.target.value)}
                    aria-label={`Status for quote ${quote._id}`}
                    className="min-w-0 border border-white/15 bg-[#111] px-3 py-2.5 text-sm text-white focus:border-[#efc400] focus:outline-none disabled:opacity-50"
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                  </select>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`quote-mobile-details-${quote._id}`}
                    onClick={() => setExpandedId(expanded ? null : quote._id)}
                    className="border border-white/15 px-3 py-2.5 text-xs font-semibold text-white"
                  >
                    {expanded ? "Hide" : "Details"}
                  </button>
                </div>
                {expanded ? (
                  <div id={`quote-mobile-details-${quote._id}`} className="mt-4 space-y-5 border-t border-white/10 pt-4 text-xs">
                    <div className="space-y-2 text-white/70">
                      <p><span className="text-white/40">Email:</span> <span className="break-all">{quote.customerInfo?.email || "—"}</span></p>
                      <p><span className="text-white/40">Phone:</span> {quote.customerInfo?.phone || "—"}</p>
                      {quote.customerInfo?.address ? <p><span className="text-white/40">Address:</span> {quote.customerInfo.address}</p> : null}
                      {quote.customerInfo?.reference ? <p><span className="text-white/40">Reference:</span> {quote.customerInfo.reference}</p> : null}
                      {quote.customerInfo?.notes ? <p className="whitespace-pre-wrap"><span className="text-white/40">Notes:</span> {quote.customerInfo.notes}</p> : null}
                    </div>
                    <div>
                      <p className="mb-2 uppercase tracking-[0.15em] text-[#efc400]">Selected products</p>
                      {products.length ? products.map((item, index) => (
                        <p key={`${item.referenceId || item.slug}-${index}`} className="flex justify-between gap-3 border-t border-white/10 py-2 text-white/70">
                          <span>{item.name}</span><span className="shrink-0">{formatCurrency(item.price)}</span>
                        </p>
                      )) : <p className="text-white/40">No products selected.</p>}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
          {!loading && !filteredQuotes.length ? <p className="p-8 text-center text-xs text-white/45">{quotes.length ? "No quotes match your filters." : "No quotes received yet."}</p> : null}
          {loading ? <p className="p-8 text-center text-xs text-white/45">Loading quotes...</p> : null}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.035] text-[10px] uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium sm:px-7">Quote</th>
                <th scope="col" className="px-5 py-4 font-medium">Customer</th>
                <th scope="col" className="px-5 py-4 font-medium">Vehicle</th>
                <th scope="col" className="px-5 py-4 font-medium">Products</th>
                <th scope="col" className="px-5 py-4 text-right font-medium">Estimate</th>
                <th scope="col" className="px-5 py-4 font-medium">Status</th>
                <th scope="col" className="px-5 py-4 text-right font-medium sm:pr-7">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => {
                const products = getProducts(quote);
                const expanded = expandedId === quote._id;
                return (
                  <Fragment key={quote._id}>
                    <tr className="border-t border-white/[0.07] transition hover:bg-white/[0.025]">
                      <td className="whitespace-nowrap px-5 py-5 align-top sm:px-7">
                        <span className="font-mono font-semibold text-[#efc400]">#{quote._id.slice(-8).toUpperCase()}</span>
                        <span className="mt-1 block text-xs text-white/35">{formatDate(quote.createdAt)}</span>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <span className="block font-semibold text-white">{quote.customerInfo?.name}</span>
                        <span className="mt-1 block max-w-[190px] truncate text-xs text-white/45" title={quote.customerInfo?.email}>{quote.customerInfo?.email}</span>
                      </td>
                      <td className="px-5 py-5 align-top text-white/75">{quote.vehicle?.name}</td>
                      <td className="px-5 py-5 align-top text-white/75">{products.length} selected</td>
                      <td className="whitespace-nowrap px-5 py-5 text-right align-top font-semibold text-white">{formatCurrency(quote.totalPrice)}</td>
                      <td className="px-5 py-5 align-top">
                        <div className={`mb-2 inline-flex border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusColors[quote.status] || statusColors.new}`}>{quote.status}</div>
                        <select
                          value={quote.status}
                          disabled={updatingId === quote._id}
                          onChange={(event) => handleStatusChange(quote._id, event.target.value)}
                          aria-label={`Status for quote ${quote._id}`}
                          className="block w-full min-w-[110px] border border-white/15 bg-[#111] px-2 py-1.5 text-xs text-white/75 focus:border-[#efc400] focus:outline-none disabled:opacity-50"
                        >
                          {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-5 text-right align-top sm:pr-7">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={`quote-details-${quote._id}`}
                          onClick={() => setExpandedId(expanded ? null : quote._id)}
                          className="whitespace-nowrap border border-white/15 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-[#efc400] hover:text-[#efc400]"
                        >
                          {expanded ? "Hide" : "View"} details
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr id={`quote-details-${quote._id}`} className="border-t border-white/[0.07] bg-[#121212]">
                        <td colSpan={7} className="px-5 py-6 sm:px-7">
                          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                            <div>
                              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efc400]">Customer details</h3>
                              <dl className="mt-4 grid grid-cols-[100px_1fr] gap-x-3 gap-y-3 text-sm">
                                <dt className="text-white/40">Phone</dt><dd className="text-white/80">{quote.customerInfo?.phone || "—"}</dd>
                                <dt className="text-white/40">Email</dt><dd className="break-all text-white/80">{quote.customerInfo?.email || "—"}</dd>
                                <dt className="text-white/40">Address</dt><dd className="text-white/80">{quote.customerInfo?.address || "—"}</dd>
                                <dt className="text-white/40">Reference</dt><dd className="text-white/80">{quote.customerInfo?.reference || "—"}</dd>
                                <dt className="text-white/40">Notes</dt><dd className="whitespace-pre-wrap text-white/80">{quote.customerInfo?.notes || "—"}</dd>
                              </dl>
                            </div>
                            <div>
                              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efc400]">Selected products</h3>
                              {products.length ? (
                                <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
                                  {products.map((item, index) => (
                                    <li key={`${item.referenceId || item.slug}-${index}`} className="flex justify-between gap-4 py-3 text-sm">
                                      <span className="text-white/80">{item.name}</span>
                                      <span className="whitespace-nowrap text-white/55">{formatCurrency(item.price)}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="mt-4 text-sm text-white/40">No products selected.</p>}
                              <p className="mt-4 flex justify-between border-t border-white/10 pt-4 text-sm font-semibold text-white"><span>Estimated total</span><span className="text-[#efc400]">{formatCurrency(quote.totalPrice)}</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              {!loading && !filteredQuotes.length ? (
                <tr><td colSpan={7} className="px-7 py-16 text-center text-sm text-white/45">{quotes.length ? "No quotes match your filters." : "No quotes received yet."}</td></tr>
              ) : null}
              {loading ? <tr><td colSpan={7} className="px-7 py-16 text-center text-sm text-white/45">Loading quotes...</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40 sm:px-7">
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </div>
      </section>
    </AdminLayout>
  );
}
