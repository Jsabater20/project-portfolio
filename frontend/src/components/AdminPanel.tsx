import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL as string;

type Servicio = {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracionMin: number;
  precio: number;
};

type Profesional = {
  id: number;
  nombre: string;
  turno: string;
  servicios: Servicio[];
};

const formatPrecio = (n: number) => `$${n.toLocaleString("es-AR")}`;

const turnoBadgeClass = (t: string) => {
  if (t === "mañana") return "bg-yellow-100 text-yellow-700";
  if (t === "tarde") return "bg-blue-100 text-blue-600";
  return "bg-purple-100 text-purple-700";
};

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  if (asking) {
    return (
      <div className="flex gap-1 items-center">
        <button
          onClick={onConfirm}
          className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
        >
          Confirmar
        </button>
        <button
          onClick={() => setAsking(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          ✕
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setAsking(true)}
      className="text-xs text-red-400 hover:text-red-600 px-2 py-0.5 rounded hover:bg-red-50"
      title="Eliminar"
    >
      🗑
    </button>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<"profesionales" | "servicios">("profesionales");
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Profesionales state ---
  const [editProf, setEditProf] = useState<Profesional | null>(null);
  const [profForm, setProfForm] = useState({ nombre: "", turno: "mañana", serviciosIds: [] as number[] });
  const [addProfVis, setAddProfVis] = useState(false);
  const [addProfForm, setAddProfForm] = useState({ nombre: "", turno: "mañana" });

  // --- Servicios state ---
  const [editServ, setEditServ] = useState<Servicio | null>(null);
  const [servForm, setServForm] = useState({ nombre: "", descripcion: "", duracionMin: 0, precio: 0 });
  const [addServVis, setAddServVis] = useState(false);
  const [addServForm, setAddServForm] = useState({ nombre: "", descripcion: "", duracionMin: 60, precio: 0 });

  const cargar = () => {
    fetch(`${API}/profesionales`).then(r => r.json()).then(setProfesionales).catch(() => {});
    fetch(`${API}/servicios`).then(r => r.json()).then(setServicios).catch(() => {});
  };

  useEffect(() => { cargar(); }, []);

  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(null), 5000); };

  // --- Profesionales CRUD ---

  const abrirEditProf = (p: Profesional) => {
    setEditProf(p);
    setProfForm({ nombre: p.nombre, turno: p.turno, serviciosIds: p.servicios.map(s => s.id) });
  };

  const guardarProf = async () => {
    if (!editProf) return;
    const res = await fetch(`${API}/profesionales/${editProf.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profForm),
    });
    if (!res.ok) { showError((await res.json()).message ?? "Error al guardar"); return; }
    setEditProf(null);
    cargar();
  };

  const eliminarProf = async (id: number) => {
    const res = await fetch(`${API}/profesionales/${id}`, { method: "DELETE" });
    if (!res.ok) { showError((await res.json()).message ?? "Error al eliminar"); return; }
    cargar();
  };

  const crearProf = async () => {
    if (!addProfForm.nombre.trim()) return;
    const res = await fetch(`${API}/profesionales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addProfForm),
    });
    if (!res.ok) { showError((await res.json()).message ?? "Error al crear"); return; }
    setAddProfVis(false);
    setAddProfForm({ nombre: "", turno: "mañana" });
    cargar();
  };

  // --- Servicios CRUD ---

  const abrirEditServ = (s: Servicio) => {
    setEditServ(s);
    setServForm({ nombre: s.nombre, descripcion: s.descripcion ?? "", duracionMin: s.duracionMin, precio: s.precio });
  };

  const guardarServ = async () => {
    if (!editServ) return;
    const res = await fetch(`${API}/servicios/${editServ.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...servForm,
        duracionMin: Number(servForm.duracionMin),
        precio: Number(servForm.precio),
      }),
    });
    if (!res.ok) { showError((await res.json()).message ?? "Error al guardar"); return; }
    setEditServ(null);
    cargar();
  };

  const eliminarServ = async (id: number) => {
    const res = await fetch(`${API}/servicios/${id}`, { method: "DELETE" });
    if (!res.ok) { showError((await res.json()).message ?? "Error al eliminar"); return; }
    cargar();
  };

  const crearServ = async () => {
    if (!addServForm.nombre.trim()) return;
    const res = await fetch(`${API}/servicios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...addServForm,
        duracionMin: Number(addServForm.duracionMin),
        precio: Number(addServForm.precio),
      }),
    });
    if (!res.ok) { showError((await res.json()).message ?? "Error al crear"); return; }
    setAddServVis(false);
    setAddServForm({ nombre: "", descripcion: "", duracionMin: 60, precio: 0 });
    cargar();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">⚙️ Panel de administración</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="text-gray-400 hover:text-gray-600 ml-4">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["profesionales", "servicios"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                tab === t ? "bg-black text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"
              }`}
            >
              {t === "profesionales" ? "👩‍💼 Profesionales" : "✨ Servicios"}
            </button>
          ))}
        </div>

        {/* ===== PROFESIONALES ===== */}
        {tab === "profesionales" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-700">
                {profesionales.length} profesionale{profesionales.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => { setAddProfVis(v => !v); setEditProf(null); }}
                className="text-sm bg-black text-white px-4 py-1.5 rounded-xl hover:bg-gray-800"
              >
                + Agregar
              </button>
            </div>

            {addProfVis && (
              <div className="bg-white border rounded-2xl p-4 space-y-3 shadow-sm">
                <p className="text-sm font-medium text-gray-700">Nuevo profesional</p>
                <input
                  className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                  placeholder="Nombre completo"
                  value={addProfForm.nombre}
                  onChange={e => setAddProfForm(f => ({ ...f, nombre: e.target.value }))}
                />
                <select
                  className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                  value={addProfForm.turno}
                  onChange={e => setAddProfForm(f => ({ ...f, turno: e.target.value }))}
                >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                  <option value="ambos">Ambos turnos</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={crearProf} className="flex-1 bg-black text-white text-sm py-1.5 rounded-xl hover:bg-gray-800">
                    Guardar
                  </button>
                  <button onClick={() => setAddProfVis(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm py-1.5 rounded-xl hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {profesionales.map(p => (
              <div key={p.id}>
                {editProf?.id === p.id ? (
                  <div className="bg-white border-2 border-black/10 rounded-2xl p-4 space-y-3 shadow-sm">
                    <p className="text-sm font-medium">Editando: <span className="text-gray-500">{p.nombre}</span></p>
                    <input
                      className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                      value={profForm.nombre}
                      onChange={e => setProfForm(f => ({ ...f, nombre: e.target.value }))}
                    />
                    <select
                      className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                      value={profForm.turno}
                      onChange={e => setProfForm(f => ({ ...f, turno: e.target.value }))}
                    >
                      <option value="mañana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="ambos">Ambos turnos</option>
                    </select>
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium">Servicios que ofrece:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {servicios.map(s => (
                          <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-black">
                            <input
                              type="checkbox"
                              checked={profForm.serviciosIds.includes(s.id)}
                              onChange={e =>
                                setProfForm(f => ({
                                  ...f,
                                  serviciosIds: e.target.checked
                                    ? [...f.serviciosIds, s.id]
                                    : f.serviciosIds.filter(id => id !== s.id),
                                }))
                              }
                            />
                            <span className="text-gray-700">{s.nombre}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={guardarProf} className="flex-1 bg-black text-white text-sm py-1.5 rounded-xl hover:bg-gray-800">
                        Guardar
                      </button>
                      <button onClick={() => setEditProf(null)} className="flex-1 bg-gray-100 text-sm py-1.5 rounded-xl hover:bg-gray-200">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{p.nombre}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${turnoBadgeClass(p.turno)}`}>{p.turno}</span>
                      </div>
                      {p.servicios.length > 0 ? (
                        <p className="text-xs text-gray-400">{p.servicios.map(s => s.nombre).join(" · ")}</p>
                      ) : (
                        <p className="text-xs text-gray-300 italic">Sin servicios asignados</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirEditProf(p)}
                        className="text-xs text-gray-400 hover:text-gray-700 px-2 py-0.5 rounded hover:bg-gray-50"
                        title="Editar"
                      >
                        ✏
                      </button>
                      <DeleteButton onConfirm={() => eliminarProf(p.id)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== SERVICIOS ===== */}
        {tab === "servicios" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-700">
                {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}
              </h2>
              <button
                onClick={() => { setAddServVis(v => !v); setEditServ(null); }}
                className="text-sm bg-black text-white px-4 py-1.5 rounded-xl hover:bg-gray-800"
              >
                + Agregar
              </button>
            </div>

            {addServVis && (
              <div className="bg-white border rounded-2xl p-4 space-y-3 shadow-sm">
                <p className="text-sm font-medium text-gray-700">Nuevo servicio</p>
                <input
                  className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                  placeholder="Nombre del servicio"
                  value={addServForm.nombre}
                  onChange={e => setAddServForm(f => ({ ...f, nombre: e.target.value }))}
                />
                <input
                  className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                  placeholder="Categoría (ej: Faciales)"
                  value={addServForm.descripcion}
                  onChange={e => setAddServForm(f => ({ ...f, descripcion: e.target.value }))}
                />
                <div className="flex gap-2">
                  <input
                    className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                    type="number"
                    placeholder="Duración (min)"
                    value={addServForm.duracionMin || ""}
                    onChange={e => setAddServForm(f => ({ ...f, duracionMin: Number(e.target.value) }))}
                  />
                  <input
                    className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                    type="number"
                    placeholder="Precio ($)"
                    value={addServForm.precio || ""}
                    onChange={e => setAddServForm(f => ({ ...f, precio: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={crearServ} className="flex-1 bg-black text-white text-sm py-1.5 rounded-xl hover:bg-gray-800">
                    Guardar
                  </button>
                  <button onClick={() => setAddServVis(false)} className="flex-1 bg-gray-100 text-gray-600 text-sm py-1.5 rounded-xl hover:bg-gray-200">
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {servicios.map(s => (
              <div key={s.id}>
                {editServ?.id === s.id ? (
                  <div className="bg-white border-2 border-black/10 rounded-2xl p-4 space-y-3 shadow-sm">
                    <p className="text-sm font-medium">Editando: <span className="text-gray-500">{s.nombre}</span></p>
                    <input
                      className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                      placeholder="Nombre"
                      value={servForm.nombre}
                      onChange={e => setServForm(f => ({ ...f, nombre: e.target.value }))}
                    />
                    <input
                      className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                      placeholder="Categoría"
                      value={servForm.descripcion}
                      onChange={e => setServForm(f => ({ ...f, descripcion: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <input
                        className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                        type="number"
                        placeholder="Duración (min)"
                        value={servForm.duracionMin}
                        onChange={e => setServForm(f => ({ ...f, duracionMin: Number(e.target.value) }))}
                      />
                      <input
                        className="border border-gray-200 p-2.5 rounded-xl w-full text-sm bg-white"
                        type="number"
                        placeholder="Precio ($)"
                        value={servForm.precio}
                        onChange={e => setServForm(f => ({ ...f, precio: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={guardarServ} className="flex-1 bg-black text-white text-sm py-1.5 rounded-xl hover:bg-gray-800">
                        Guardar
                      </button>
                      <button onClick={() => setEditServ(null)} className="flex-1 bg-gray-100 text-sm py-1.5 rounded-xl hover:bg-gray-200">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium">{s.nombre}</span>
                        {s.descripcion && (
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{s.descripcion}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{s.duracionMin} min · {formatPrecio(s.precio)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirEditServ(s)}
                        className="text-xs text-gray-400 hover:text-gray-700 px-2 py-0.5 rounded hover:bg-gray-50"
                        title="Editar"
                      >
                        ✏
                      </button>
                      <DeleteButton onConfirm={() => eliminarServ(s.id)} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
