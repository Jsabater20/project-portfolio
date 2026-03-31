type Profesional = {
  id: number;
  nombre: string;
  turno: 'mañana' | 'tarde' | 'ambos';
};

const turnoLabel = {
  mañana: '☀️ Mañana',
  tarde:  '🌆 Tarde',
  ambos:  '🕐 Mañana y tarde',
};

type Props = {
  profesionales: Profesional[];
  setProfesionalId: (id: number) => void;
};

export default function SelectProfesionalServicio({
  profesionales,
  setProfesionalId,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Profesional</label>
      <select
        onChange={(e) => setProfesionalId(Number(e.target.value))}
        className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white text-gray-700 focus:ring-2 focus:ring-gray-300 focus:outline-none"
      >
        <option value="">Seleccionar profesional...</option>
        {profesionales.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre} — {turnoLabel[p.turno]}
        </option>
        ))}
      </select>
    </div>
  );
}