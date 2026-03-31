type Servicio = {
  id: number;
  nombre: string;
  duracionMin: number;
  precio: number;
};

type Props = {
  servicios: Servicio[];
  setServicioId: (id: number) => void;
};

export default function SelectServicio({ servicios, setServicioId }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Servicio</label>
      <select
        onChange={(e) => setServicioId(Number(e.target.value))}
        className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white text-gray-700 focus:ring-2 focus:ring-gray-300 focus:outline-none"
      >
        <option value="">Seleccionar servicio...</option>
        {servicios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre} — {s.duracionMin} min — ${s.precio.toLocaleString('es-AR')}
          </option>
        ))}
      </select>
    </div>
  );
}