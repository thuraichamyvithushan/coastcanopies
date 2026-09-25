import { productConfig } from "../../config/productConfig.js";

export const SpecificationsModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm md:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="specification-title"
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-white/15 bg-[#131313] p-5 text-white shadow-2xl md:p-8"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#efc400]">Coast Canopies</p>
            <h2 id="specification-title" className="mt-2 text-2xl font-semibold md:text-3xl">
              {productConfig.name} Specification
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close specification"
            className="border border-white/15 px-3 py-2 text-sm text-white/60 hover:border-[#efc400] hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {productConfig.specificationGroups.map((group) => (
            <div key={group.name} className="border-t-2 border-[#efc400] bg-white/[0.025] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#efc400]">{group.name}</h3>
              <ul className="mt-4 space-y-2.5 text-sm leading-5 text-white/70">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#efc400]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
