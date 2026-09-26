import { formatNzd } from "../../utils/pricing.js";
import { preloadModel } from "../../utils/preloadModel.js";

export const AccessoryCard = ({
  accessory,
  selected,
  state,
  onStateChange,
  onToggle
}) => (
  <article
    onPointerEnter={() => preloadModel(accessory.model)}
    onFocus={() => preloadModel(accessory.model)}
    className={`px-1 py-3 transition lg:border lg:p-3.5 ${
      selected
        ? "lg:border-[#efc400] lg:bg-[#efc400]/[0.07]"
        : "lg:border-white/10 lg:bg-white/[0.025] lg:hover:border-white/25"
    }`}
  >
    <div className="flex items-center gap-2 lg:gap-3">
      <h3 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-white">{accessory.name}</h3>
      <p className="shrink-0 whitespace-nowrap text-[11px] text-[#efc400] lg:text-[10px] lg:uppercase lg:tracking-[0.2em]">
        {accessory.included ? "Included" : `+ ${formatNzd(accessory.price)}`}
      </p>
      <button
        type="button"
        disabled={accessory.included}
        onClick={() => onToggle(accessory)}
        aria-label={accessory.included ? `${accessory.name} included` : `${selected ? "Remove" : "Add"} ${accessory.name}`}
        aria-pressed={selected || accessory.included}
        className={`flex h-9 w-9 shrink-0 items-center justify-center lg:h-6 lg:w-6 ${accessory.included ? "cursor-default" : "cursor-pointer"}`}
      >
        <span className={`flex h-4 w-4 items-center justify-center border ${selected || accessory.included ? "border-[#efc400] bg-[#efc400] text-black" : "border-white/40"}`}>
          {selected || accessory.included ? <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="m3 8 3 3 7-7" /></svg> : null}
        </span>
      </button>
    </div>

    {accessory.states ? (
      <div className="mt-2 grid grid-cols-2 gap-1 lg:mt-3 lg:border lg:border-white/10 lg:bg-black/30 lg:p-1">
        {Object.keys(accessory.states).map((stateName) => (
          <button
            key={stateName}
            type="button"
            onClick={() => onStateChange(stateName)}
            className={`border-b-2 px-2 py-2 text-[11px] transition lg:border-b-0 lg:px-3 lg:text-[10px] lg:uppercase lg:tracking-[0.18em] ${
              state === stateName ? "border-[#efc400] text-[#efc400] lg:bg-[#efc400] lg:text-black" : "border-transparent text-white/55 hover:text-white"
            }`}
          >
            {stateName}
          </button>
        ))}
      </div>
    ) : null}

    <span aria-hidden="true" className={`mt-2 block h-px w-6 lg:hidden ${selected ? "bg-[#efc400]" : "bg-white/25"}`} />
  </article>
);
