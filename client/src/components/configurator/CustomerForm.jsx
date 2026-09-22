const fields = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "reference", label: "Quote / Reference", type: "text", required: false }
];

export const CustomerForm = ({ value, onChange }) => (
  <div className="space-y-3">
    {fields.map((field) => (
      <label key={field.name} className="block">
        <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">
          {field.label}
        </span>
        <input
          required={field.required}
          type={field.type}
          name={field.name}
          value={value[field.name]}
          onChange={onChange}
          className="w-full border border-white/10 bg-[#080808] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#efc400]"
        />
      </label>
    ))}
    <label className="block">
      <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/45">Notes</span>
      <textarea
        name="notes"
        rows="4"
        value={value.notes}
        onChange={onChange}
        className="w-full resize-none border border-white/10 bg-[#080808] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#efc400]"
      />
    </label>
  </div>
);

