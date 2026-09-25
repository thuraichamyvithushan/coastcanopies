import { Link, useLocation } from "react-router-dom";
import { SiteShell } from "../components/layout/SiteShell.jsx";
import { formatCurrency } from "../utils/currency.js";

const nextSteps = [
  { number: "01", title: "Request received", description: "Your build details are now with the Coast Canopies team." },
  { number: "02", title: "Build review", description: "We will check your selections and any notes you included." },
  { number: "03", title: "Personal quote", description: "Our team will use your contact details to follow up with a quote." }
];

export default function QuoteSuccessPage() {
  const { state } = useLocation();
  let savedConfirmation = null;
  try {
    savedConfirmation = JSON.parse(window.sessionStorage.getItem("coast-quote-confirmation") || "null");
  } catch {
    // A fresh visit can still show the general confirmation page.
  }
  const confirmation = state?.quoteId ? state : savedConfirmation;
  const hasQuote = Boolean(confirmation?.quoteId);

  return (
    <SiteShell>
      <div className="min-h-screen bg-[#0b0b0b] text-white">
        <div className="mx-auto max-w-6xl px-3 py-5 sm:px-8 sm:py-12">
          <Link to="/" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/55 transition hover:text-[#efc400]">
            <span aria-hidden="true">←</span> Coast Canopies
          </Link>

          <div className="mt-6 grid overflow-hidden border border-white/10 bg-[#141414] sm:mt-10 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="relative overflow-hidden px-4 py-8 sm:px-12 sm:py-16 lg:py-20">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#efc400]/10 blur-3xl" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center border border-[#efc400]/45 bg-[#efc400]/10 text-[#efc400] sm:h-16 sm:w-16 sm:rounded-full">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6 sm:h-8 sm:w-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#efc400] sm:mt-9 sm:text-xs sm:tracking-[0.32em]">Quote request received</p>
                <h1 className="mt-3 max-w-xl font-display text-3xl font-semibold uppercase leading-tight tracking-[-0.02em] sm:mt-4 sm:text-6xl sm:font-normal sm:leading-[0.95]">
                  Your build is on its way.
                </h1>
                <p className="mt-4 max-w-lg text-sm leading-6 text-white/65 sm:mt-6 sm:text-base sm:leading-7">
                  {confirmation?.customerName ? `Thanks, ${confirmation.customerName}. ` : "Thanks. "}
                  We have your selections and will review the build before preparing your quote.
                </p>

                <div className="mt-7 border-t border-white/10 pt-5 sm:mt-10 sm:pt-7">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">What happens next</p>
                  <ol className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
                    {nextSteps.map((step) => (
                      <li key={step.number} className="flex gap-5">
                        <span className="font-display text-base text-[#efc400] sm:text-xl">{step.number}</span>
                        <div>
                          <p className="font-semibold text-white">{step.title}</p>
                          <p className="mt-1 text-sm leading-6 text-white/50">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <aside className="flex flex-col justify-between border-t border-white/10 bg-[#1b1a17] px-4 py-7 sm:px-10 sm:py-10 lg:border-l lg:border-t-0 lg:py-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#efc400]">Your request</p>
                {hasQuote ? (
                  <div className="mt-5 space-y-5 sm:mt-8 sm:space-y-7">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Reference number</p>
                      <p className="mt-2 break-all font-mono text-sm text-white sm:text-xl">{confirmation.quoteId}</p>
                    </div>
                    {confirmation.totalPrice != null ? (
                      <div className="border-t border-white/10 pt-7">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Estimated build total</p>
                        <p className="mt-2 font-display text-3xl text-[#efc400] sm:text-4xl">{formatCurrency(confirmation.totalPrice)}</p>
                        <p className="mt-2 text-xs leading-5 text-white/40">Final pricing will be confirmed in your quote.</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-8 text-sm leading-6 text-white/55">
                    Your request details are available immediately after submission. If you need your reference, please contact the Coast Canopies team.
                  </p>
                )}
              </div>
              <div className="mt-7 sm:mt-12">
                <Link to="/" className="inline-flex w-full items-center justify-center gap-3 bg-[#efc400] px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[#ffd43b]">
                  Start another build <span aria-hidden="true">→</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
