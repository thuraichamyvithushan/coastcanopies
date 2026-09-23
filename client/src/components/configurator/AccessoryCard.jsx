import { formatNzd } from "../../utils/pricing.js";
import { preloadModel } from "../../utils/preloadModel.js";

export const AccessoryCard = ({
  accessory,
  selected,
  state,
  onStateChange,
  onToggle,
  onFocus
}) => (
  <article
    onPointerEnter={() => preloadModel(accessory.model)}
    onFocus={() => preloadModel(accessory.model)}
    className={`border p-3.5 transition ${
      selected
        ? "border-[#efc400] bg-[#efc400]/[0.07]"
        : "border-white/10 bg-white/[0.025] hover:border-white/25"
    }`}
  >
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold leading-5 text-white">{accessory.name}</h3>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#efc400]">
              {accessory.included ? "Included" : `+ ${formatNzd(accessory.price)}`}
            </p>
          </div>
          <button
            type="button"
            disabled={accessory.included}
            onClick={() => onToggle(accessory)}
            aria-label={`${selected ? "Remove" : "Add"} ${accessory.name}`}
            className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs ${
              selected ? "border-[#efc400] bg-[#efc400] text-black" : "border-white/25 text-transparent"
            } ${accessory.included ? "cursor-default" : "cursor-pointer"}`}
          >
            ✓
          </button>
        </div>
      </div>
    </div>

    {accessory.states ? (
      <div className="mt-3 grid grid-cols-2 gap-1 border border-white/10 bg-black/30 p-1">
        {Object.keys(accessory.states).map((stateName) => (
          <button
            key={stateName}
            type="button"
            onClick={() => onStateChange(stateName)}
            className={`px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition ${
              state === stateName ? "bg-[#efc400] text-black" : "text-white/55 hover:text-white"
            }`}
          >
            {stateName}
          </button>
        ))}
      </div>
    ) : null}

    <button
      type="button"
      onClick={() => onFocus(accessory.id)}
      className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/45 transition hover:text-[#efc400]"
    >
      View in 3D →
    </button>
  </article>
);
