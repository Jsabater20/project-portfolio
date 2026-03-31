type Props = {
  horarios: string[];
  turnoOcupado: (hora: string) => boolean;
  horaSeleccionada: string;
  setHora: (h: string) => void;
};

export default function Horarios({
  horarios,
  turnoOcupado,
  horaSeleccionada,
  setHora,
}: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Elegir horario</p>
      <div className="grid grid-cols-4 gap-2">
        {horarios.map((h) => {
          const ocupado = turnoOcupado(h);
          const seleccionado = horaSeleccionada === h;

          return (
            <button
              key={h}
              disabled={ocupado}
              onClick={() => setHora(h)}
              className={`
                py-2 rounded-xl text-sm font-medium border transition-all duration-150
                ${
                  ocupado
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                    : seleccionado
                    ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                }
              `}
            >
              {h}
            </button>
          );
        })}
      </div>
    </div>
  );
}