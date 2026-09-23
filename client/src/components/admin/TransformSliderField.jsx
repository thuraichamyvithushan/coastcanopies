import { useEffect, useState } from "react";

export const TransformSliderField = ({
  label,
  name,
  value,
  onChange,
  min = 0.1,
  max = 5.0,
  step = 0.05,
  unit = "",
  hint
}) => {
  const [axes, setAxes] = useState({ x: 1, y: 1, z: 1 });
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    try {
      const parsed = typeof value === "string" ? JSON.parse(value) : value;
      if (parsed && typeof parsed === "object") {
        setAxes({
          x: Number(parsed.x) || 0,
          y: Number(parsed.y) || 0,
          z: Number(parsed.z) || 0
        });
      }
    } catch {
      // keep existing state if invalid JSON string during typing
    }
  }, [value]);

  const updateAxis = (axis, val) => {
    const num = Number(val);
    const updated = { ...axes, [axis]: isNaN(num) ? 0 : num };
    setAxes(updated);
    onChange({
      target: {
        name,
        value: JSON.stringify(updated, null, 2)
      }
    });
  };

  const handleUniformScale = (val) => {
    const num = Number(val);
    const updated = { x: num, y: num, z: num };
    setAxes(updated);
    onChange({
      target: {
        name,
        value: JSON.stringify(updated, null, 2)
      }
    });
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.25em] text-white/70 font-semibold">{label}</span>
        <button
          type="button"
          onClick={() => setShowJson((curr) => !curr)}
          className="text-xs text-[#f9bf1a] underline hover:text-[#ffd04a] transition"
        >
          {showJson ? "Use Sliders" : "RAW JSON"}
        </button>
      </div>

      {showJson ? (
        <div className="mt-3">
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            rows={4}
            className="w-full rounded-2xl border border-white/10 bg-black/60 p-3 font-mono text-sm text-white outline-none focus:border-[#f9bf1a]"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3.5">
          {name === "modelScale" ? (
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span className="text-[11px] uppercase tracking-wider text-white/50 w-20 shrink-0">Uniform</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={axes.x === axes.y && axes.y === axes.z ? axes.x : 1}
                onChange={(e) => handleUniformScale(e.target.value)}
                className="flex-1 accent-[#f9bf1a] cursor-pointer"
              />
              <span className="w-16 text-right font-mono text-xs text-[#f9bf1a]">
                {axes.x === axes.y && axes.y === axes.z ? axes.x.toFixed(2) : "Custom"}
              </span>
            </div>
          ) : null}

          {["x", "y", "z"].map((axis) => (
            <div key={axis} className="flex items-center gap-3">
              <span className="w-5 font-semibold uppercase text-[#f9bf1a] text-xs shrink-0">{axis}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={axes[axis]}
                onChange={(e) => updateAxis(axis, e.target.value)}
                className="flex-1 accent-[#f9bf1a] cursor-pointer"
              />
              <input
                type="number"
                step={step}
                value={axes[axis]}
                onChange={(e) => updateAxis(axis, e.target.value)}
                className="w-20 rounded-xl border border-white/10 bg-black/60 px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-[#f9bf1a]"
              />
              <span className="w-4 text-[10px] text-white/40 shrink-0">{unit}</span>
            </div>
          ))}
        </div>
      )}

      {hint ? <p className="mt-3 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
};
