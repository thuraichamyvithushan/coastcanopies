import { useEffect, useState } from "react";
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
  modelScale: '{\n  "x": 1,\n  "y": 1,\n  "z": 1\n}',
  modelPosition: '{\n  "x": 0,\n  "y": 0,\n  "z": 0\n}',
  modelRotation: '{\n  "x": 0,\n  "y": 0,\n  "z": 0\n}',
  price: "0",
  canvasSize: '{\n  "width": 1000,\n  "height": 600\n}'
};

const initialSelectedFiles = {
  modelFile: null
};

export default function VehicleManagerPage() {
  const { auth } = useAuth();
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
      modelScale: JSON.stringify(vehicle.modelScale || { x: 1, y: 1, z: 1 }, null, 2),
      modelPosition: JSON.stringify(vehicle.modelPosition || { x: 0, y: 0, z: 0 }, null, 2),
      modelRotation: JSON.stringify(vehicle.modelRotation || { x: 0, y: 0, z: 0 }, null, 2),
      price: String(vehicle.price),
      canvasSize: JSON.stringify(vehicle.canvasSize, null, 2)
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
        ...form,
        modelUrl,
        modelScale: JSON.parse(form.modelScale),
        modelPosition: JSON.parse(form.modelPosition),
        modelRotation: JSON.parse(form.modelRotation),
        price: Number(form.price),
        canvasSize: JSON.parse(form.canvasSize)
      };

      if (editingId) {
        await updateVehicle(auth.token, editingId, payload);
        setMessage("Vehicle updated.");
      } else {
        await createVehicle(auth.token, payload);
        setMessage("Vehicle created.");
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
      description="Maintain vehicle platforms, GLB 3D models, and configurator alignment settings."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="panel rounded-[2rem] p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">
            {editingId ? "Edit Vehicle" : "Add Vehicle"}
          </h2>
          <div className="mt-6 space-y-4">
            <Field label="Name" name="name" value={form.name} onChange={handleChange} />
            <Field label="Slug" name="slug" value={form.slug} onChange={handleChange} />
            <Field label="Brand" name="brand" value={form.brand} onChange={handleChange} />
            <FileField
              label="3D Vehicle Model"
              name="modelFile"
              accept=".glb,model/gltf-binary,application/octet-stream"
              onChange={handleFileChange}
              hint={
                selectedFiles.modelFile
                  ? `Selected: ${selectedFiles.modelFile.name}`
                  : editingId && form.modelUrl
                    ? "A 3D model is attached. Choose a GLB file only to replace it."
                    : "Optional: choose a self-contained GLB model for the live 3D builder."
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
              hint='Position relative to the builder scene. Example: { "x": 0, "y": 0, "z": 0 }'
            />
            <JsonTextAreaField
              label="3D Rotation JSON (degrees)"
              name="modelRotation"
              value={form.modelRotation}
              onChange={handleChange}
              hint='Rotation uses degrees. Example: { "x": 0, "y": 90, "z": 0 }'
            />
            <Field label="Price" name="price" type="number" value={form.price} onChange={handleChange} />
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
              className="rounded-full bg-[#f9bf1a] px-5 py-3 font-medium text-black disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : editingId ? "Save Vehicle" : "Create Vehicle"}
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
          {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
        </form>

        <section className="panel rounded-[2rem] p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-white">Current Vehicles</h2>
          <div className="mt-6 space-y-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl uppercase tracking-[0.06em] text-white">{vehicle.name}</h3>
                    <p className="mt-2 text-sm text-white/55">
                      {vehicle.brand} • {vehicle.slug}
                    </p>
                    <p className="mt-2 text-sm text-white/45">
                      {vehicle.modelUrl ? "3D model attached" : "Procedural 3D fallback"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(vehicle)}
                      className="rounded-full border border-[#f9bf1a]/50 px-4 py-2 text-[#f9bf1a]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vehicle._id)}
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
