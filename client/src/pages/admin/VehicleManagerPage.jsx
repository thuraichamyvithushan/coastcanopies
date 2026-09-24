import { useEffect, useRef, useState } from "react";
import {
  createVehicle,
  deleteVehicle,
  fetchVehicles,
  uploadModelAsset,
  updateVehicle
} from "../../api/admin.js";
import { AdminLayout } from "../../components/admin/AdminLayout.jsx";
import { JsonTextAreaField } from "../../components/admin/JsonTextAreaField.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const initialForm = {
  name: "",
  slug: "",
  brand: "",
  svgBase: "",
  modelUrl: "",
  scaleX: "1",
  scaleY: "1",
  scaleZ: "1",
  posX: "0",
  posY: "0",
  posZ: "0",
  rotX: "0",
  rotY: "0",
  rotZ: "0",
  price: "0",
  canvasSize: '{\n  "width": 1000,\n  "height": 600\n}'
};

const initialSelectedFiles = {
  modelFile: null
};

const formatAxes = (obj, fallback = { x: 1, y: 1, z: 1 }, suffix = "") => {
  const x = Number(obj?.x ?? fallback.x).toFixed(2);
  const y = Number(obj?.y ?? fallback.y).toFixed(2);
  const z = Number(obj?.z ?? fallback.z).toFixed(2);
  return `X: ${x}${suffix} · Y: ${y}${suffix} · Z: ${z}${suffix}`;
};

export default function VehicleManagerPage() {
  const { auth } = useAuth();
  const formRef = useRef(null);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(initialSelectedFiles);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const loadVehicles = async () => {
    try {
      setVehicles(await fetchVehicles());
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadVehicles();
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

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setSelectedFiles(initialSelectedFiles);
    setUploadStatus(null);
    setForm({
      name: vehicle.name,
      slug: vehicle.slug,
      brand: vehicle.brand,
      svgBase: vehicle.svgBase || "",
      modelUrl: vehicle.modelUrl || "",
      scaleX: String(vehicle.modelScale?.x ?? 1),
      scaleY: String(vehicle.modelScale?.y ?? 1),
      scaleZ: String(vehicle.modelScale?.z ?? 1),
      posX: String(vehicle.modelPosition?.x ?? 0),
      posY: String(vehicle.modelPosition?.y ?? 0),
      posZ: String(vehicle.modelPosition?.z ?? 0),
      rotX: String(vehicle.modelRotation?.x ?? 0),
      rotY: String(vehicle.modelRotation?.y ?? 0),
      rotZ: String(vehicle.modelRotation?.z ?? 0),
      price: String(vehicle.price),
      canvasSize: JSON.stringify(vehicle.canvasSize, null, 2)
    });
    formRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const vehicleSlug = form.slug.trim();
      const modelUrl = selectedFiles.modelFile
        ? (await uploadModelAsset(auth.token, {
            assetType: "model",
            file: selectedFiles.modelFile,
            slug: vehicleSlug,
            onProgress: setUploadStatus
          })).path
        : form.modelUrl;

      if (selectedFiles.modelFile) {
        setForm((current) => ({ ...current, modelUrl }));
        setSelectedFiles(initialSelectedFiles);
        setUploadStatus({ phase: "saving", percent: 100 });
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        brand: form.brand,
        svgBase: form.svgBase,
        modelUrl,
        modelScale: {
          x: Number(form.scaleX) || 1,
          y: Number(form.scaleY) || 1,
          z: Number(form.scaleZ) || 1
        },
        modelPosition: {
          x: Number(form.posX) || 0,
          y: Number(form.posY) || 0,
          z: Number(form.posZ) || 0
        },
        modelRotation: {
          x: Number(form.rotX) || 0,
          y: Number(form.rotY) || 0,
          z: Number(form.rotZ) || 0
        },
        price: Number(form.price),
        canvasSize: JSON.parse(form.canvasSize)
      };

      if (editingId) {
        await updateVehicle(auth.token, editingId, payload);
        setMessage("Vehicle updated successfully.");
      } else {
        await createVehicle(auth.token, payload);
        setMessage("Vehicle created successfully.");
      }

      resetForm();
      loadVehicles();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVehicle(auth.token, id);
      setMessage("Vehicle deleted.");
      loadVehicles();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <AdminLayout
      title="Vehicle Manager"
      description="Manually control vehicle 3D platform dimensions, scene coordinates, and pricing."
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form ref={formRef} onSubmit={handleSubmit} className="panel rounded-[2rem] p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">
            {editingId ? "Edit Vehicle Sizes & Details" : "Add Vehicle"}
          </h2>

          <div className="mt-6 space-y-5">
            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Slug" name="slug" value={form.slug} onChange={handleChange} />
            <Field label="Brand" name="brand" value={form.brand} onChange={handleChange} />

            <FileField
              label="3D Vehicle Model (.glb)"
              name="modelFile"
              accept=".glb,model/gltf-binary,application/octet-stream"
              onChange={handleFileChange}
              hint={
                selectedFiles.modelFile
                  ? `Selected: ${selectedFiles.modelFile.name}`
                  : editingId && form.modelUrl
                    ? "A 3D model is attached. Choose a GLB file to replace it."
                    : "Optional GLB 3D model file."
              }
            />

            {/* Manual Size & Dimension Field Inputs */}
            <div className="rounded-3xl border border-[#f9bf1a]/30 bg-[#f9bf1a]/[0.03] p-5 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f9bf1a] block">
                  Manual 3D Vehicle Scale (Size Multiplier)
                </span>
                <p className="mt-1 text-xs text-white/50">Manually type scale multipliers for Length, Height, and Width (Default = 1.0)</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Length Scale (X)" name="scaleX" type="number" step="0.01" value={form.scaleX} onChange={handleChange} />
                <Field label="Height Scale (Y)" name="scaleY" type="number" step="0.01" value={form.scaleY} onChange={handleChange} />
                <Field label="Width Scale (Z)" name="scaleZ" type="number" step="0.01" value={form.scaleZ} onChange={handleChange} />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70 block pt-2 border-t border-white/10">
                  Manual Position Coordinates (Metres)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Position X (Length)" name="posX" type="number" step="0.01" value={form.posX} onChange={handleChange} />
                <Field label="Position Y (Height)" name="posY" type="number" step="0.01" value={form.posY} onChange={handleChange} />
                <Field label="Position Z (Width)" name="posZ" type="number" step="0.01" value={form.posZ} onChange={handleChange} />
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70 block pt-2 border-t border-white/10">
                  Manual Rotation Angles (Degrees)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Rotation X (°)" name="rotX" type="number" step="1" value={form.rotX} onChange={handleChange} />
                <Field label="Rotation Y (°)" name="rotY" type="number" step="1" value={form.rotY} onChange={handleChange} />
                <Field label="Rotation Z (°)" name="rotZ" type="number" step="1" value={form.rotZ} onChange={handleChange} />
              </div>
            </div>

            <Field label="Price (NZD)" name="price" type="number" value={form.price} onChange={handleChange} />

            <JsonTextAreaField
              label="Canvas Size JSON"
              name="canvasSize"
              value={form.canvasSize}
              onChange={handleChange}
              hint='Example: { "width": 1000, "height": 600 }'
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={isSubmitting}
              className="rounded-full bg-[#f9bf1a] px-6 py-3 font-semibold text-black disabled:opacity-60 transition hover:bg-[#ffd04a]"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save Vehicle Sizes" : "Create Vehicle"}
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
            <UploadProgress status={uploadStatus} noun="vehicle" />
          ) : null}
          {message ? <p className="mt-4 text-sm font-semibold text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
        </form>

        <section className="panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Current Vehicles</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-[#f9bf1a] font-semibold">{vehicles.length} Models</span>
          </div>
          <p className="mt-1 text-xs text-white/50">Current vehicle size dimensions and scene coordinates.</p>

          <div className="mt-6 space-y-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase tracking-[0.06em] text-white">{vehicle.name}</h3>
                    <p className="mt-1 text-sm text-white/55">
                      {vehicle.brand} • {vehicle.slug}
                    </p>
                    <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-white/40">
                      {vehicle.modelUrl ? "✓ 3D Model Attached" : "Procedural 3D Fallback"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(vehicle)}
                      className="rounded-full border border-[#f9bf1a] bg-[#f9bf1a]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#f9bf1a] hover:bg-[#f9bf1a] hover:text-black transition"
                    >
                      Edit Sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vehicle._id)}
                      className="rounded-full border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Clean Manual Sizes Display Badge */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#f9bf1a] font-semibold">3D Dimensions (Scale)</span>
                    <span className="font-mono text-xs text-white font-semibold">
                      {formatAxes(vehicle.modelScale, { x: 1, y: 1, z: 1 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-white/50">
                    <span>Position:</span>
                    <span className="font-mono text-white/80">{formatAxes(vehicle.modelPosition, { x: 0, y: 0, z: 0 }, "m")}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs text-white/50">
                    <span>Rotation:</span>
                    <span className="font-mono text-white/80">{formatAxes(vehicle.modelRotation, { x: 0, y: 0, z: 0 }, "°")}</span>
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

const Field = ({ label, name, value, onChange, type = "text", step, placeholder, required = true }) => (
  <label className="block">
    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/55">{label}</span>
    <input
      required={required}
      name={name}
      type={type}
      step={step}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#f9bf1a]"
    />
  </label>
);

const FileField = ({ label, name, accept, onChange, hint }) => (
  <label className="block">
    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/55">{label}</span>
    <input
      name={name}
      type="file"
      accept={accept}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-[#f9bf1a] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black"
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
