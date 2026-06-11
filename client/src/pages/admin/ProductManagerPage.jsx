import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  uploadVehicleAsset,
  updateProduct
} from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { JsonTextAreaField } from "../../components/admin/JsonTextAreaField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const initialForm = {
  name: "",
  slug: "",
  type: "canopy",
  svg: "",
  price: "0",
  description: "",
  positions:
    '[\n  {\n    "vehicleSlug": "toyota-hilux",\n    "x": 470,\n    "y": 170,\n    "width": 310,\n    "height": 170\n  }\n]'
};

const initialSelectedFiles = {
  productSvgFile: null
};

export default function ProductManagerPage() {
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      setProducts(await fetchProducts());
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const nextFile = files?.[0] || null;

    setSelectedFiles((current) => ({
      ...current,
      [name]: nextFile
    }));
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setSelectedFiles(initialSelectedFiles);
    setForm({
      name: product.name,
      slug: product.slug,
      type: product.type,
      svg: product.svg,
      price: String(product.price),
      description: product.description || "",
      positions: JSON.stringify(product.positions, null, 2)
    });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
    setSelectedFiles(initialSelectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const svg = selectedFiles.productSvgFile
        ? await uploadSelectedAsset(auth.token, {
            assetType: "product-svg",
            file: selectedFiles.productSvgFile,
            slug: form.slug.trim()
          })
        : form.svg;

      const payload = {
        ...form,
        svg,
        price: Number(form.price),
        positions: JSON.parse(form.positions)
      };

      if (editingId) {
        await updateProduct(auth.token, editingId, payload);
        setMessage("Product updated.");
      } else {
        await createProduct(auth.token, payload);
        setMessage("Product created.");
      }

      resetForm();
      loadProducts();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(auth.token, id);
      setMessage("Product deleted.");
      loadProducts();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <AdminLayout
      title="Product Manager"
      description="Control the canopy catalog and per-vehicle placement metadata. Product positions also determine which vehicles can use each item."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="panel rounded-[2rem] p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>
          <div className="mt-6 space-y-4">
            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Slug" name="slug" value={form.slug} onChange={handleChange} />
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">Type</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
              >
                <option value="canopy">Canopy</option>
                <option value="module">Module</option>
                <option value="accessory">Accessory</option>
              </select>
            </label>
            <FileField
              label="Product SVG File"
              name="productSvgFile"
              accept=".svg,image/svg+xml"
              onChange={handleFileChange}
              required={!editingId && !form.svg}
              hint={
                selectedFiles.productSvgFile
                  ? `Selected: ${selectedFiles.productSvgFile.name}`
                  : editingId
                    ? "Choose a new SVG only if you want to replace the current product artwork."
                    : "Choose an SVG from your folder."
              }
            />
            <Field label="Price" name="price" type="number" value={form.price} onChange={handleChange} />
            <label className="block">
              <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
              />
            </label>
            <JsonTextAreaField
              label="Positions JSON"
              name="positions"
              value={form.positions}
              onChange={handleChange}
              hint="Provide an array of placement objects keyed by vehicle slug. Listed vehicles are the only compatible vehicles for that product."
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={isSubmitting}
              className="rounded-full bg-[#f9bf1a] px-5 py-3 font-medium text-black disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save Product" : "Create Product"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="rounded-full border border-white/15 px-5 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
            >
              Clear
            </button>
          </div>
          {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
        </form>

        <section className="panel rounded-[2rem] p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Current Products</h2>
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <div key={product._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase tracking-[0.06em] text-white">{product.name}</h3>
                    <p className="mt-2 text-sm uppercase tracking-[0.25em] text-[#f9bf1a]">{product.type}</p>
                    <p className="mt-2 text-sm text-white/55">{product.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="rounded-full border border-[#f9bf1a]/50 px-4 py-2 text-[#f9bf1a]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="rounded-full border border-red-500/30 px-4 py-2 text-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

const uploadSelectedAsset = async (token, { assetType, file, slug }) => {
  const dataUrl = await readFileAsDataUrl(file);
  const response = await uploadVehicleAsset(token, {
    assetType,
    slug,
    fileName: file.name,
    dataUrl
  });

  return response.path;
};

const Field = ({ label, name, value, onChange, type = "text" }) => (
  <label className="block">
    <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">{label}</span>
    <input
      required
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
    />
  </label>
);

const FileField = ({ label, name, accept, onChange, required = false, hint }) => (
  <label className="block">
    <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">{label}</span>
    <input
      required={required}
      name={name}
      type="file"
      accept={accept}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#f9bf1a] file:px-4 file:py-2 file:font-medium file:text-black"
    />
    {hint ? <p className="mt-2 text-xs text-white/45">{hint}</p> : null}
  </label>
);
