import { useCallback, useEffect, useState } from "react";

type Profesional = {
  id: number;
  nombre: string;
  turno: 'mañana' | 'tarde' | 'ambos';
};

type Servicio = {
  id: number;
  nombre: string;
  duracionMin: number;
  precio: number;
  profesionales: Profesional[];
};

type Turno = {
  id: number;
  inicio: string;
  fin: string;
  estado: 'reservado' | 'completado' | 'cancelado';
  cliente: { nombre: string };
  servicio: { nombre: string };
  profesional: { nombre: string };
};

const API = import.meta.env.VITE_API_URL as string;

const getLunesActual = (): string => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  return `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
};

const addDays = (fecha: string, days: number): string => {
  const d = new Date(`${fecha}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function useAgenda() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [profesionalesDisponibles, setProfesionalesDisponibles] = useState<Profesional[]>([]);

  // --- agenda panel (independiente del formulario) ---
  const [agendaTurnos, setAgendaTurnos] = useState<Turno[]>([]);
  const [agendaFecha, setAgendaFecha] = useState(new Date().toISOString().split('T')[0]);
  const [agendaProfesionalId, setAgendaProfesionalId] = useState<number | null>(null);
  const [agendaRefreshKey, setAgendaRefreshKey] = useState(0);
  const [agendaLoadedFor, setAgendaLoadedFor] = useState('');

  // inline error para crear turno
  const [turnoError, setTurnoError] = useState<string | null>(null);

  // --- historial del cliente ---
  const [historialTurnos, setHistorialTurnos] = useState<Turno[]>([]);

  // --- vista semanal ---
  const [semanaFechaInicio, setSemanaFechaInicio] = useState(getLunesActual);
  const [semanaTurnos, setSemanaTurnos] = useState<Turno[]>([]);

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [clienteNombre, setClienteNombre] = useState<string | null>(null);
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [profesionalId, setProfesionalId] = useState<number | null>(null);

  const hoy = new Date().toISOString().split("T")[0];

  const horariosMañana = ["09:00", "10:00", "11:00", "12:00"];
  const horariosTarde  = ["13:00", "14:00", "15:00", "16:00", "17:00"];
  const todosHorarios  = [...horariosMañana, ...horariosTarde];

  const turnoDelProfesional = profesionalesDisponibles.find(p => p.id === profesionalId)?.turno;

  const horarios =
    turnoDelProfesional === 'mañana' ? horariosMañana :
    turnoDelProfesional === 'tarde'  ? horariosTarde  :
    todosHorarios;

  // cargar servicios y profesionales al inicio
  useEffect(() => {
    fetch(`${API}/servicios`).then(r => r.json()).then(setServicios).catch(() => {});
    fetch(`${API}/profesionales`).then(r => r.json()).then((data) => {
      if (Array.isArray(data)) setProfesionales(data);
    }).catch(() => {});
  }, []);

  // agendaLoading: true mientras la key actual no coincide con la última carga completada
  const agendaKey = `${agendaFecha}-${agendaProfesionalId}-${agendaRefreshKey}`;
  const agendaLoading = agendaKey !== agendaLoadedFor;

  // cargar agenda panel
  const cargarAgendaPanel = useCallback(() => {
    setAgendaRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ fecha: agendaFecha });
    if (agendaProfesionalId) params.set('profesionalId', String(agendaProfesionalId));
    const key = `${agendaFecha}-${agendaProfesionalId}-${agendaRefreshKey}`;
    fetch(`${API}/turnos/agenda?${params}`)
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAgendaTurnos(data);
        setAgendaLoadedFor(key);
      })
      .catch(() => { setAgendaLoadedFor(key); });
  }, [agendaFecha, agendaProfesionalId, agendaRefreshKey]);

  // cargar historial cuando se identifica un cliente
  const cargarHistorial = useCallback((id: number) => {
    fetch(`${API}/clientes/${id}/turnos`)
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setHistorialTurnos(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (clienteId) cargarHistorial(clienteId);
  }, [clienteId, cargarHistorial]);

  // cargar vista semanal
  const cargarSemana = useCallback(() => {
    const params = new URLSearchParams({ fechaInicio: semanaFechaInicio });
    if (agendaProfesionalId) params.set('profesionalId', String(agendaProfesionalId));
    fetch(`${API}/turnos/semana?${params}`)
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setSemanaTurnos(data); })
      .catch(() => {});
  }, [semanaFechaInicio, agendaProfesionalId]);

  useEffect(() => {
    cargarSemana();
  }, [cargarSemana]);

  const semanaAnterior  = () => setSemanaFechaInicio(f => addDays(f, -7));
  const semanaSiguiente = () => setSemanaFechaInicio(f => addDays(f, 7));

  const cargarAgenda = useCallback(() => {
    fetch(`${API}/turnos/agenda?profesionalId=${profesionalId}&fecha=${fecha}`)
      .then(r => r.json())
      .then((data) => { if (Array.isArray(data)) setTurnos(data); })
      .catch(() => {});
  }, [fecha, profesionalId]);

  // cargar agenda cuando cambia profesional o fecha
  useEffect(() => {
    if (!fecha || !profesionalId) return;
    cargarAgenda();
  }, [fecha, profesionalId, cargarAgenda]);

  const seleccionarServicio = (id: number) => {
    setServicioId(id);
    setProfesionalId(null);
    const servicio = servicios.find(s => s.id === id);
    setProfesionalesDisponibles(servicio?.profesionales || []);
  };

  const horarioOcupado = (h: string): boolean => {
    if (!fecha) return false;
    const inicioSeleccion = new Date(`${fecha}T${h}:00`);
    const duracion = servicios.find(s => s.id === servicioId)?.duracionMin || 0;
    const finSeleccion = new Date(inicioSeleccion.getTime() + duracion * 60000);

    return turnos.some(t =>
      inicioSeleccion < new Date(t.fin) && finSeleccion > new Date(t.inicio)
    );
  };

  const crearTurno = async () => {
    if (!hora || !fecha || !clienteId || !servicioId || !profesionalId) {
      setTurnoError("Completá todos los campos");
      return;
    }

    setTurnoError(null);
    const res = await fetch(`${API}/turnos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inicio: new Date(`${fecha}T${hora}:00`),
        clienteId,
        servicioId,
        profesionalId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setTurnoError(err?.message ?? "Error al crear el turno");
      return;
    }

    setHora("");
    setTurnoError(null);
    cargarAgenda();
    cargarAgendaPanel();
    cargarSemana();
  };

  const cancelarTurno = async (id: number) => {
    await fetch(`${API}/turnos/${id}/cancelar`, { method: 'PATCH' });
    cargarAgenda();
    cargarAgendaPanel();
    cargarSemana();
  };

  const completarTurno = async (id: number) => {
    await fetch(`${API}/turnos/${id}/completar`, { method: 'PATCH' });
    cargarAgenda();
    cargarAgendaPanel();
    cargarSemana();
  };

  return {
    // datos
    servicios,
    profesionales,
    profesionalesDisponibles,
    horarios,
    hoy,
    // agenda panel independiente
    agendaTurnos,
    agendaFecha, setAgendaFecha,
    agendaProfesionalId, setAgendaProfesionalId,
    agendaLoading,
    // historial del cliente
    historialTurnos,
    // error inline turno
    turnoError, setTurnoError,
    // vista semanal
    semanaFechaInicio, semanaTurnos,
    semanaAnterior, semanaSiguiente,
    // selección
    fecha, setFecha,
    hora, setHora,
    clienteId, setClienteId,
    clienteNombre, setClienteNombre,
    resetCliente: () => { setClienteId(null); setClienteNombre(null); setHistorialTurnos([]); },
    servicioId,
    profesionalId, setProfesionalId,
    // acciones
    seleccionarServicio,
    horarioOcupado,
    crearTurno,
    cancelarTurno,
    completarTurno,
  };
}

