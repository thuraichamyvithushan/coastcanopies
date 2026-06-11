import { Link, useLocation } from "react-router-dom";
import { SiteShell } from "../components/layout/SiteShell.jsx";
import { formatCurrency } from "../utils/currency.js";

export default function QuoteSuccessPage() {
  const { state } = useLocation();

  return (
    <SiteShell>
      <section className="flex min-h-[70vh] items-center px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <div className="panel rounded-[2.5rem] p-8 text-center shadow-glow md:p-12">
            <p className="font-display text-sm uppercase tracking-[0.5em] text-[#f9bf1a]">Quote Submitted</p>
            <h1 className="mt-4 font-display text-5xl uppercase tracking-[0.08em] text-white md:text-6xl">
              Your build is with the Coast team.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-white/65">
              {state?.customerName || "Thanks"} for sending your configurator request. Our team can now review the
              selected vehicle, canopy, modules, and accessories before preparing your quote.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">Reference</p>
                <p className="mt-3 font-display text-2xl uppercase tracking-[0.06em] text-white">
                  {state?.quoteId || "Pending"}
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">Estimated Build</p>
                <p className="mt-3 font-display text-2xl uppercase tracking-[0.06em] text-[#f9bf1a]">
                  {formatCurrency(state?.totalPrice || 0)}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/"
                className="rounded-full bg-[#f9bf1a] px-6 py-3 font-medium text-black transition hover:opacity-85"
              >
                Build Another Vehicle
              </Link>
              <Link
                to="/"
                className="rounded-full border border-white/15 px-6 py-3 text-white transition hover:border-[#f9bf1a] hover:text-[#f9bf1a]"
              >
                Return to Builder
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
