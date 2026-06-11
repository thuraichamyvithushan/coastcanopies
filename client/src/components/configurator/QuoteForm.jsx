export const QuoteForm = ({ form, onChange, onSubmit, submitting }) => (
  <form onSubmit={onSubmit} className="panel rounded-[1.5rem] p-5 md:rounded-[2rem] md:p-6">
    <p className="font-display text-xs uppercase tracking-[0.35em] text-[#f9bf1a] md:text-sm md:tracking-[0.45em]">Quote Request</p>
    <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-2">
      <TextField label="Name" name="name" value={form.name} onChange={onChange} required />
      <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
      <TextField label="Phone" name="phone" value={form.phone} onChange={onChange} required />
      <TextField label="Address" name="address" value={form.address} onChange={onChange} required />
      <label className="md:col-span-2">
        <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">Notes</span>
        <textarea
          name="notes"
          rows="4"
          value={form.notes}
          onChange={onChange}
          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
          placeholder="Tell us about intended use, preferred fit-out, or special requirements."
        />
      </label>
    </div>
    <button
      type="submit"
      disabled={submitting}
      className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f9bf1a] px-6 py-3 font-medium text-black transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
    >
      {submitting ? "Submitting..." : "Submit Quote Request"}
    </button>
  </form>
);

const TextField = ({ label, name, type = "text", value, onChange, required }) => (
  <label>
    <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/55 md:text-sm md:tracking-[0.25em]">{label}</span>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
    />
  </label>
);
