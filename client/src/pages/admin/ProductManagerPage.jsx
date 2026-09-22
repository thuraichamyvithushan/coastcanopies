import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  uploadModelAsset,
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
  modelUrl: "",
  modelScale: '{\n  "x": 1,\n  "y": 1,\n  "z": 1\n}',
  modelPosition: '{\n  "x": 0,\n  "y": 0,\n  "z": 0\n}',
  modelRotation: '{\n  "x": 0,\n  "y": 0,\n  "z": 0\n}',
  price: "0",
  description: "",
  positions:
    '[\n  {\n    "vehicleSlug": "toyota-hilux",\n    "x": 470,\n    "y": 170,\n    "width": 310,\n    "height": 170\n  }\n]'
};

const initialSelectedFiles = {
  productModelFile: null
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
  const [uploadStatus, setUploadStatus] = useState(null);

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
    setUploadStatus(null);
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setSelectedFiles(initialSelectedFiles);
    setUploadStatus(null);
    setForm({
      name: product.name,
      slug: product.slug,
      type: product.type,
      svg: product.svg,
      modelUrl: product.modelUrl || "",
      modelScale: JSON.stringify(product.modelScale || { x: 1, y: 1, z: 1 }, null, 2),
      modelPosition: JSON.stringify(product.modelPosition || { x: 0, y: 0, z: 0 }, null, 2),
      modelRotation: JSON.stringify(product.modelRotation || { x: 0, y: 0, z: 0 }, null, 2),
      price: String(product.price),
      description: product.description || "",
      positions: JSON.stringify(product.positions, null, 2)
    });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
    setSelectedFiles(initialSelectedFiles);
    setUploadStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);
    setUploadStatus(null);

    try {
      const modelUrl = selectedFiles.productModelFile
        ? (await uploadModelAsset(auth.token, {
            assetType: "product-model",
            file: selectedFiles.productModelFile,
            slug: form.slug.trim(),
            onProgress: setUploadStatus
          })).path
        : form.modelUrl;

      if (selectedFiles.productModelFile) {
        setForm((current) => ({ ...current, modelUrl }));
        setSelectedFiles(initialSelectedFiles);
        setUploadStatus({ phase: "saving", percent: 100 });
      }

      const payload = {
        ...form,
        modelUrl,
        modelScale: JSON.parse(form.modelScale),
        modelPosition: JSON.parse(form.modelPosition),
        modelRotation: JSON.parse(form.modelRotation),
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
      description="Control GLB 3D models, pricing, and per-vehicle compatibility."
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
              label="3D Product Model"
              name="productModelFile"
              accept=".glb,model/gltf-binary,application/octet-stream"
              onChange={handleFileChange}
              hint={
                selectedFiles.productModelFile
                  ? `Selected: ${selectedFiles.productModelFile.name}`
                  : editingId && form.modelUrl
                    ? "A 3D model is attached. Choose a GLB file only to replace it."
                    : "Optional: choose a self-contained GLB model for the live 3D configurator."
              }
            />
            <JsonTextAreaField
              label="3D Scale JSON"
              name="modelScale"
              value={form.modelScale}
              onChange={handleChange}
              hint='Model scale. Example: { "x": 1, "y": 1, "z": 1 }'
            />
            <JsonTextAreaField
              label="3D Position JSON"
              name="modelPosition"
              value={form.modelPosition}
              onChange={handleChange}
              hint='Position the product relative to the vehicle. Example: { "x": 1.1, "y": 1.4, "z": 0 }'
            />
            <JsonTextAreaField
              label="3D Rotation JSON (degrees)"
              name="modelRotation"
              value={form.modelRotation}
              onChange={handleChange}
              hint='Rotation uses degrees. Example: { "x": 0, "y": 90, "z": 0 }'
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
          {isSubmitting && uploadStatus ? (
            <UploadProgress status={uploadStatus} noun="product" />
          ) : null}
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
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
                      {product.modelUrl ? "3D model attached" : "Procedural 3D fallback"}
                    </p>
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

const Field = ({ label, name, value, onChange, type = "text", placeholder, required = true }) => (
  <label className="block">
    <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">{label}</span>
    <input
      required={required}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-[#f9bf1a]"
    />
  </label>
);

const FileField = ({ label, name, accept, onChange, hint }) => (
  <label className="block">
    <span className="mb-2 block text-sm uppercase tracking-[0.25em] text-white/55">{label}</span>
    <input
      name={name}
      type="file"
      accept={accept}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#f9bf1a] file:px-4 file:py-2 file:font-medium file:text-black"
    />
    {hint ? <p className="mt-2 text-xs text-white/45">{hint}</p> : null}
  </label>
);

const UploadProgress = ({ status, noun }) => {
  const label =
    status.phase === "uploading"
      ? `Uploading 3D model: ${status.percent}%`
      : status.phase === "finalizing"
        ? "Finalizing 3D model..."
        : `Saving ${noun}...`;

  return (
    <div className="mt-4" aria-live="polite">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#f9bf1a] transition-[width] duration-300"
          style={{ width: `${status.percent}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-white/65">{label}</p>
    </div>
  );
};
