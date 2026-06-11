export const StatsGrid = ({ stats }) => (
  <div className="admin-grid">
    {stats.map((item) => (
      <div key={item.label} className="panel rounded-[2rem] p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">{item.label}</p>
        <p className="mt-3 font-display text-5xl uppercase tracking-[0.06em] text-[#f9bf1a]">
          {item.value}
        </p>
        <p className="mt-3 text-sm text-white/55">{item.caption}</p>
      </div>
    ))}
  </div>
);
