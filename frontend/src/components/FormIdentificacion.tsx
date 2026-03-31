import { useState } from "react";

const API = import.meta.env.VITE_API_URL as string;

interface Props {
  onIdentificado: (clienteId: number, nombreCompleto: string) => void;
}

export default function FormIdentificacion({ onIdentificado }: Props) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !email.trim() || !telefono.trim()) {
      setError("Nombre, apellido, teléfono y email son obligatorios");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const res = await fetch(`${API}/clientes/identificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: `${nombre.trim()} ${apellido.trim()}`,
          email: email.trim(),
          telefono: telefono.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Error al verificar los datos");
        return;
      }

      const cliente = await res.json();
      onIdentificado(cliente.id, `${nombre.trim()} ${apellido.trim()}`);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 border border-gray-100 rounded-2xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tus datos</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Nombre</label>
          <input
            type="text"
            placeholder="Ej: María"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Apellido</label>
          <input
            type="text"
            placeholder="Ej: García"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Teléfono</label>
        <input
          type="tel"
          placeholder="Ej: 1122334455"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-400">Email</label>
        <input
          type="email"
          placeholder="Ej: correo@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 p-2.5 w-full rounded-xl text-sm bg-white"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-gray-900 text-white py-2 rounded-xl text-sm hover:bg-gray-700 transition disabled:opacity-50"
      >
        {cargando ? "Verificando..." : "Confirmar datos →"}
      </button>
    </form>
  );
}
