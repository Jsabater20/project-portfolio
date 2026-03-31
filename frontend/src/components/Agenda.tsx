import { useState } from "react";
import { diaBloqueado } from "../utils/feriados";
import { useAgenda } from "../hooks/useAgenda";
import Horarios from "./Horarios";
import ListaTurnos from "./ListaTurnos";
import FormIdentificacion from "./FormIdentificacion";
import SelectServicio from "./SelectServicio";
import SelectProfesionalServicio from "./SelectProfesionalServicio";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatDiaCorto(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

function formatRangoSemana(lunes: string) {
  const d = new Date(`${lunes}T00:00:00`);
  const dom = new Date(`${lunes}T00:00:00`);
  dom.setDate(dom.getDate() + 6);
  return `${d.getDate()} ${MESES[d.getMonth()]} – ${dom.getDate()} ${MESES[dom.getMonth()]} ${dom.getFullYear()}`;
}

function localDate(isoStr: string) {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const estadoBadge: Record<string, string> = {
  reservado:  "bg-green-100 text-green-700",
  completado: "bg-blue-100 text-blue-700",
  cancelado:  "bg-red-100 text-red-500",
};

export default function Agenda() {
  const {
    servicios, profesionales, profesionalesDisponibles,
    horarios, hoy,
    fecha, setFecha,
    hora, setHora,
    clienteId, setClienteId,
    clienteNombre, setClienteNombre, resetCliente,
    servicioId, profesionalId, setProfesionalId,
    seleccionarServicio, horarioOcupado, crearTurno,
    cancelarTurno, completarTurno,
    agendaTurnos, agendaFecha, setAgendaFecha,
    agendaProfesionalId, setAgendaProfesionalId, agendaLoading,
    historialTurnos,
    semanaFechaInicio, semanaTurnos, semanaAnterior, semanaSiguiente,
    turnoError, setTurnoError,
  } = useAgenda();

  const servicioSeleccionado = servicios.find(s => s.id === servicioId);

  // vista del panel derecho: día o semana
  const [vistaMode, setVistaMode] = useState<"dia" | "semana">("dia");
  // historial visible en panel izquierdo
  const [historialVis, setHistorialVis] = useState(false);

  // agrupación de turnos por día para vista semanal
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${semanaFechaInicio}T00:00:00`);
    d.setDate(d.getDate() + i);
    const fechaDia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      fecha: fechaDia,
      label: formatDiaCorto(fechaDia),
      turnos: semanaTurnos.filter(t => localDate(t.inicio) === fechaDia),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-200 p-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

        {/* FORM */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/60 p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white text-sm">✨</div>
            <h1 className="text-xl font-semibold text-gray-900">Crear turno</h1>
          </div>

          <div className="space-y-3">

            <SelectServicio
              servicios={servicios}
              setServicioId={(id) => { seleccionarServicio(id); setTurnoError(null); }}
            />

            {servicioSeleccionado && (
              <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-700">
                <span>⏱ {servicioSeleccionado.duracionMin} min</span>
                <span className="text-indigo-300">·</span>
                <span>💲 ${servicioSeleccionado.precio.toLocaleString('es-AR')}</span>
              </div>
            )}

            {servicioId && (
              <SelectProfesionalServicio
                profesionales={profesionalesDisponibles}
                setProfesionalId={setProfesionalId}
              />
            )}

            <input
              type="date"
              value={fecha}
              min={hoy}
              onChange={(e) => setFecha(e.target.value)}
              className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white text-gray-700 focus:ring-2 focus:ring-gray-300 focus:outline-none"
            />

            {fecha && diaBloqueado(fecha) && (
              <p className="text-red-500 text-sm">🚫 No disponible</p>
            )}

            {fecha && profesionalId && !diaBloqueado(fecha) && (
              <>
                {clienteId ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <span className="text-sm text-green-800">👤 {clienteNombre}</span>
                      <button
                        onClick={() => { resetCliente(); setHistorialVis(false); }}
                        className="text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        Cambiar
                      </button>
                    </div>

                    {/* Historial toggle */}
                    <button
                      onClick={() => setHistorialVis(v => !v)}
                      className="w-full text-left text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 bg-gray-50 rounded-lg flex justify-between items-center transition"
                    >
                      <span>📋 Historial ({historialTurnos.length} turno{historialTurnos.length !== 1 ? "s" : ""})</span>
                      <span>{historialVis ? "▲" : "▼"}</span>
                    </button>

                    {historialVis && (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {historialTurnos.length === 0 ? (
                          <p className="text-xs text-gray-400 italic px-2">Sin turnos anteriores</p>
                        ) : (
                          historialTurnos.map(t => {
                            const d = new Date(t.inicio);
                            const fechaStr = d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
                            const horaStr  = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            return (
                              <div key={t.id} className="flex items-center justify-between bg-white border rounded-lg px-3 py-2 text-xs">
                                <div>
                                  <span className="font-medium">{horaStr} · {fechaStr}</span>
                                  <span className="text-gray-400 ml-1">— {t.servicio.nombre}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full ${estadoBadge[t.estado] ?? ""}`}>{t.estado}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <FormIdentificacion
                    onIdentificado={(id, nombre) => {
                      setClienteId(id);
                      setClienteNombre(nombre);
                    }}
                  />
                )}

                {clienteId && (
                  <>
                    <Horarios
                      horarios={horarios}
                      turnoOcupado={horarioOcupado}
                      horaSeleccionada={hora}
                      setHora={setHora}
                    />

                    {turnoError && (
                      <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">
                        <span>{turnoError}</span>
                        <button onClick={() => setTurnoError(null)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
                      </div>
                    )}

                    <button
                      onClick={crearTurno}
                      className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-black hover:shadow-lg transition-all duration-150"
                    >
                      Confirmar turno
                    </button>
                  </>
                )}
              </>
            )}

          </div>
        </div>

        {/* AGENDA */}
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/60 p-6 border border-gray-100 flex flex-col gap-4">

          {/* Header + toggle día/semana */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white text-sm">📅</div>
              <h2 className="text-xl font-semibold text-gray-900">Agenda</h2>
            </div>
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              {(["dia", "semana"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setVistaMode(m)}
                  className={`text-xs px-3 py-1 rounded-md transition ${
                    vistaMode === m ? "bg-white shadow text-black font-medium" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {m === "dia" ? "Día" : "Semana"}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro de profesional (siempre visible) */}
          <select
            value={agendaProfesionalId ?? ""}
            onChange={(e) => setAgendaProfesionalId(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-200 p-2.5 rounded-xl text-sm bg-white text-gray-700 focus:ring-2 focus:ring-gray-300 focus:outline-none"
          >
            <option value="">Todos los profesionales</option>
            {profesionales.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>

          {/* ===== VISTA DÍA ===== */}
          {vistaMode === "dia" && (
            <>
              <input
                type="date"
                value={agendaFecha}
                onChange={(e) => setAgendaFecha(e.target.value)}
                className="border border-gray-200 p-2.5 rounded-xl text-sm bg-white text-gray-700 focus:ring-2 focus:ring-gray-300 focus:outline-none"
              />

              {agendaLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span className="text-sm">Cargando agenda...</span>
                </div>
              ) : (
                <>
                  {agendaTurnos.length > 0 && (() => {
                const reservados  = agendaTurnos.filter(t => t.estado === 'reservado').length;
                const completados = agendaTurnos.filter(t => t.estado === 'completado').length;
                const cancelados  = agendaTurnos.filter(t => t.estado === 'cancelado').length;
                return (
                  <div className="flex gap-2 text-xs flex-wrap">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {agendaTurnos.length} turno{agendaTurnos.length !== 1 ? 's' : ''}
                    </span>
                    {reservados  > 0 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">{reservados} reservado{reservados !== 1 ? 's' : ''}</span>}
                    {completados > 0 && <span className="bg-blue-100  text-blue-700  px-3 py-1 rounded-full">{completados} completado{completados !== 1 ? 's' : ''}</span>}
                    {cancelados  > 0 && <span className="bg-red-100   text-red-500   px-3 py-1 rounded-full">{cancelados} cancelado{cancelados !== 1 ? 's' : ''}</span>}
                  </div>
                );
              })()}

              <ListaTurnos
                turnos={agendaTurnos}
                onCancelar={cancelarTurno}
                onCompletar={completarTurno}
                mostrarProfesional={!agendaProfesionalId}
              />
                </>
              )}
            </>
          )}

          {/* ===== VISTA SEMANA ===== */}
          {vistaMode === "semana" && (
            <>
              {/* Navegación */}
              <div className="flex items-center justify-between">
                <button
                  onClick={semanaAnterior}
                  className="text-gray-400 hover:text-black px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                >
                  ←
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {formatRangoSemana(semanaFechaInicio)}
                </span>
                <button
                  onClick={semanaSiguiente}
                  className="text-gray-400 hover:text-black px-2 py-1 rounded-lg hover:bg-gray-100 transition"
                >
                  →
                </button>
              </div>

              {/* 7 día-cards */}
              <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1">
                {diasSemana.map(({ fecha: f, label, turnos }) => (
                  <div key={f} className="border rounded-xl p-3 bg-white/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      {turnos.length > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {turnos.length}
                        </span>
                      )}
                    </div>
                    {turnos.length === 0 ? (
                      <p className="text-xs text-gray-300 italic">Sin turnos</p>
                    ) : (
                      <div className="space-y-1">
                        {turnos.map(t => {
                          const d = new Date(t.inicio);
                          const horaStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                          return (
                            <div key={t.id} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 w-11 shrink-0">{horaStr}</span>
                              <span className="text-gray-700 truncate flex-1">{t.cliente.nombre}</span>
                              <span className="text-gray-400 truncate max-w-[100px]">{t.servicio.nombre}</span>
                              <span className={`shrink-0 px-1.5 py-0.5 rounded-full text-[10px] ${estadoBadge[t.estado] ?? ""}`}>
                                {t.estado}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
