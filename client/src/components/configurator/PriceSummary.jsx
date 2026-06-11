import { formatCurrency } from "../../utils/currency.js";

export const PriceSummary = ({ vehicle, canopy, modules, accessories, totalPrice }) => (
  <div className="panel rounded-[1.5rem] p-5 md:rounded-[2rem] md:p-6">
    <p className="font-display text-xs uppercase tracking-[0.35em] text-[#f9bf1a] md:text-sm md:tracking-[0.45em]">Live Pricing</p>
    <div className="mt-4 space-y-3 md:mt-5 md:space-y-4">
      <SummaryLine label={vehicle?.name || "Vehicle"} value={vehicle?.price || 0} />
      <SummaryLine label={canopy?.name || "Base System"} value={canopy?.price || 0} />
      {modules.map((item) => (
        <SummaryLine key={item._id} label={item.name} value={item.price} />
      ))}
      {accessories.map((item) => (
        <SummaryLine key={item._id} label={item.name} value={item.price} />
      ))}
    </div>
    <div className="mt-5 border-t border-white/10 pt-5 md:mt-6 md:pt-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/50 md:text-sm md:tracking-[0.3em]">Estimated total</p>
      <p className="mt-2 font-display text-3xl uppercase tracking-[0.04em] text-[#f9bf1a] md:text-5xl">
        {formatCurrency(totalPrice)}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/55">
        Indicative pricing only. Final fitment, finish, and freight are confirmed during quoting.
      </p>
    </div>
  </div>
);

const SummaryLine = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm text-white/80">
    <span className="pr-3">{label}</span>
    <span className="shrink-0 font-medium text-white">{formatCurrency(value)}</span>
  </div>
);
