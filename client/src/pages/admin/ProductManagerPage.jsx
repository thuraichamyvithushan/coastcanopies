import { useEffect, useRef, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  uploadModelAsset,
  updateProduct
} from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { JsonTextAreaField } from "../../components/admin/JsonTextAreaField.jsx";
import { TransformSliderField } from "../../components/admin/TransformSliderField.jsx";
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

const formatAxes = (obj, fallback = { x: 1, y: 1, z: 1 }, suffix = "") => {
  const x = Number(obj?.x ?? fallback.x).toFixed(2);
  const y = Number(obj?.y ?? fallback.y).toFixed(2);
  const z = Number(obj?.z ?? fallback.z).toFixed(2);
  return `X: ${x}${suffix} · Y: ${y}${suffix} · Z: ${z}${suffix}`;
};

export default function ProductManagerPage() {
  const { auth } = useAuth();
  const formRef = useRef(null);
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
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleQuickScale = async (product, scaleFactor) => {
    try {
      setMessage("");
      setError("");
      const updatedScale = { x: scaleFactor, y: scaleFactor, z: scaleFactor };
      await updateProduct(auth.token, product._id, {
        ...product,
        modelScale: updatedScale
      });
      setMessage(`Updated ${product.name} 3D scale to ${scaleFactor}x`);
      loadProducts();
    } catch (scaleError) {
      setError(scaleError.message);
    }
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
        <form ref={formRef} onSubmit={handleSubmit} className="panel rounded-[2rem] p-6">
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
            <TransformSliderField
              label="3D Product Scale"
              name="modelScale"
              value={form.modelScale}
              onChange={handleChange}
              min={0.1}
              max={4.0}
              step={0.05}
              unit="x"
              hint="Adjust 3D size across X (width), Y (height), Z (depth) or use Uniform slider."
            />
            <TransformSliderField
              label="3D Product Position"
              name="modelPosition"
              value={form.modelPosition}
              onChange={handleChange}
              min={-5.0}
              max={5.0}
              step={0.05}
              unit="m"
              hint="Position relative to vehicle (X = forward/back, Y = up/down, Z = left/right)."
            />
            <TransformSliderField
              label="3D Product Rotation"
              name="modelRotation"
              value={form.modelRotation}
              onChange={handleChange}
              min={-180}
              max={180}
              step={5}
              unit="°"
              hint="Rotate 3D model in degrees (X, Y, Z)."
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Current Products</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-[#f9bf1a] font-semibold">{products.length} Items</span>
          </div>
          <p className="mt-1 text-xs text-white/50">Easily view and adjust product 3D scales and coordinates directly.</p>

          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <div key={product._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-2xl uppercase tracking-[0.06em] text-white">{product.name}</h3>
                      <span className="rounded-full border border-[#f9bf1a]/30 bg-[#f9bf1a]/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#f9bf1a]">
                        {product.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/55">{product.description || "No description"}</p>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-white/40">
                      {product.modelUrl ? "✓ 3D Model Attached" : "Procedural 3D Fallback"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="rounded-full border border-[#f9bf1a]/50 bg-[#f9bf1a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#f9bf1a] hover:bg-[#f9bf1a] hover:text-black transition"
                    >
                      Adjust Controls
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="rounded-full border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline 3D Size Display & Quick Presets */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#f9bf1a] font-semibold">3D Model Scale (Size)</span>
                      <p className="mt-0.5 font-mono text-xs text-white/90">
                        {formatAxes(product.modelScale, { x: 1, y: 1, z: 1 })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">Quick Scale:</span>
                      {[0.5, 0.8, 1.0, 1.2, 1.5, 2.0].map((scaleFactor) => {
                        const isSelected =
                          Number(product.modelScale?.x || 1) === scaleFactor &&
                          Number(product.modelScale?.y || 1) === scaleFactor &&
                          Number(product.modelScale?.z || 1) === scaleFactor;
                        return (
                          <button
                            key={scaleFactor}
                            type="button"
                            onClick={() => handleQuickScale(product, scaleFactor)}
                            title={`Quick set scale to ${scaleFactor}x`}
                            className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                              isSelected
                                ? "border-[#f9bf1a] bg-[#f9bf1a] text-black"
                                : "border-white/15 bg-white/5 text-white/70 hover:border-[#f9bf1a] hover:text-white"
                            }`}
                          >
                            {scaleFactor}x
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-2.5 flex flex-wrap items-center justify-between text-[11px] text-white/50">
                    <span>Position: <strong className="font-mono text-white/80">{formatAxes(product.modelPosition, { x: 0, y: 0, z: 0 }, "m")}</strong></span>
                    <span>Rotation: <strong className="font-mono text-white/80">{formatAxes(product.modelRotation, { x: 0, y: 0, z: 0 }, "°")}</strong></span>
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
