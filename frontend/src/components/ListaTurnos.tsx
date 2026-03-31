type Turno = {
  id: number;
  inicio: string;
  fin: string;
  estado: "reservado" | "completado" | "cancelado";
  cliente: { nombre: string };
  servicio: { nombre: string };
  profesional: { nombre: string };
};

type Props = {
  turnos: Turno[];
  onCancelar: (id: number) => void;
  onCompletar: (id: number) => void;
  mostrarProfesional?: boolean;
};

const estadoBadge: Record<Turno["estado"], string> = {
  reservado:  "bg-green-100 text-green-700",
  completado: "bg-blue-100 text-blue-700",
  cancelado:  "bg-red-100 text-red-500",
};

const estadoLabel: Record<Turno["estado"], string> = {
  reservado:  "Reservado",
  completado: "Completado",
  cancelado:  "Cancelado",
};

function TurnoCard({ turno, onCancelar, onCompletar, mostrarProfesional }: {
  turno: Turno;
  onCancelar: (id: number) => void;
  onCompletar: (id: number) => void;
  mostrarProfesional?: boolean;
}) {
  const inicio = new Date(turno.inicio).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fin    = new Date(turno.fin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const activo = turno.estado === "reservado";

  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex justify-between items-start gap-3">

        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{inicio} – {fin}</p>
          <p className="text-sm text-gray-700 mt-0.5 truncate">{turno.cliente.nombre}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{turno.servicio.nombre}</p>
          {mostrarProfesional && (
            <p className="text-xs text-violet-500 mt-0.5">👩‍💼 {turno.profesional.nombre}</p>
          )}
        </div>

        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${estadoBadge[turno.estado]}`}>
          {estadoLabel[turno.estado]}
        </span>

      </div>

      {activo && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={() => onCompletar(turno.id)}
            className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 rounded-xl font-medium transition"
          >
            ✔ Completar
          </button>
          <button
            onClick={() => onCancelar(turno.id)}
            className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-500 py-1.5 rounded-xl font-medium transition"
          >
            ✕ Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function Bloque({ titulo, turnos, onCancelar, onCompletar, mostrarProfesional }: {
  titulo: string;
  turnos: Turno[];
  onCancelar: (id: number) => void;
  onCompletar: (id: number) => void;
  mostrarProfesional?: boolean;
}) {
  if (turnos.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-400 mb-2">{titulo}</p>
      <div className="space-y-2">
        {turnos.map(t => (
          <TurnoCard key={t.id} turno={t} onCancelar={onCancelar} onCompletar={onCompletar} mostrarProfesional={mostrarProfesional} />
        ))}
      </div>
    </div>
  );
}

export default function ListaTurnos({ turnos, onCancelar, onCompletar, mostrarProfesional }: Props) {
  const mañana = turnos.filter(t => new Date(t.inicio).getHours() < 13);
  const tarde  = turnos.filter(t => new Date(t.inicio).getHours() >= 13);

  return (
    <div className="space-y-5">
      {turnos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-300">
          <span className="text-3xl mb-2">📂</span>
          <p className="text-sm">Sin turnos para este día</p>
        </div>
      )}
      <Bloque titulo="☀️ Mañana" turnos={mañana} onCancelar={onCancelar} onCompletar={onCompletar} mostrarProfesional={mostrarProfesional} />
      <Bloque titulo="🌆 Tarde"  turnos={tarde}  onCancelar={onCancelar} onCompletar={onCompletar} mostrarProfesional={mostrarProfesional} />
    </div>
  );
}
