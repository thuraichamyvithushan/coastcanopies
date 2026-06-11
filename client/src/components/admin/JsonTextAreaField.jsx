export const JsonTextAreaField = ({ label, name, value, onChange, rows = 8, hint }) => (
  <label className="block">
    <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">{label}</span>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="min-h-[180px] w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-4 font-mono text-sm text-white outline-none transition focus:border-[#f9bf1a]"
    />
    {hint ? <span className="mt-2 block text-xs text-white/40">{hint}</span> : null}
  </label>
);
