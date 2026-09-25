import { productConfig } from "../../config/productConfig.js";
import { formatNzd } from "../../utils/pricing.js";
import { CustomerForm } from "./CustomerForm.jsx";

export const BuildSummary = ({
  selectedVehicle,
  selectedTray,
  selectedCanopy,
  optionalExtras,
  selectedOptionalExtras,
  grandTotal,
  customer,
  onCustomerChange,
  onRequestQuote,
  onReset,
  submitting
}) => (
  <div>
    <div className="lg:border lg:border-white/10 lg:bg-[#0d0d0d] lg:p-4">
      <p className="text-[10px] uppercase tracking-[0.25em] text-[#efc400]">Build Summary</p>
      <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">{productConfig.name}</h2>
      <p className="mt-3 text-sm text-white/65">Vehicle: {selectedVehicle?.name}</p>
      <p className="mt-1 text-sm text-white/65">Tray: {selectedTray?.name}</p>
      <p className="mt-1 text-sm text-white/65">Canopy: {selectedCanopy?.name}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4 text-white/60">
          <dt>Vehicle</dt>
          <dd className="text-white">{formatNzd(selectedVehicle?.price)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-white/60">
          <dt>Selected Products</dt>
          <dd className="text-white">{formatNzd(optionalExtras)}</dd>
        </div>
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-end justify-between gap-4">
            <dt className="text-xs uppercase tracking-[0.18em] text-white/50">Estimated Total</dt>
            <dd className="text-2xl font-semibold text-[#efc400]">{formatNzd(grandTotal)}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Selected Products</p>
        {selectedOptionalExtras.length ? (
          <ul className="mt-2 space-y-2 text-sm text-white/65">
            {selectedOptionalExtras.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="min-w-0">{item.name}</span>
                <span className="shrink-0">{formatNzd(item.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/35">No products selected.</p>
        )}
      </div>
    </div>

    <form onSubmit={onRequestQuote} className="mt-5 space-y-5">
      <CustomerForm value={customer} onChange={onCustomerChange} />

      <div className="grid gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#efc400] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#d9ad00] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {submitting ? "Sending Request..." : "Request Quote"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2.5 text-[10px] uppercase tracking-[0.18em] text-white/40 transition hover:text-white"
        >
          Reset Build
        </button>
      </div>
    </form>
  </div>
);
