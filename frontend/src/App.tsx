import { Component, type ReactNode, useState } from "react";
import Agenda from "./components/Agenda";
import AdminPanel from "./components/AdminPanel";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-red-600">
          <p className="font-bold">Error al cargar la app:</p>
          <pre className="text-sm mt-2 whitespace-pre-wrap">{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

type Vista = "agenda" | "admin";

function App() {
  const [vista, setVista] = useState<Vista>("agenda");

  return (
    <ErrorBoundary>
      <div>
        {/* Navbar */}
        <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-0 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 py-3">
            <span className="text-xl">💅</span>
            <span className="font-semibold text-gray-800 tracking-tight">Turnero Estética</span>
          </div>
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setVista("agenda")}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition ${
                vista === "agenda" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              📅 Turnos
            </button>
            <button
              onClick={() => setVista("admin")}
              className={`text-sm font-medium px-4 py-1.5 rounded-lg transition ${
                vista === "admin" ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              ⚙️ Admin
            </button>
          </div>
        </nav>

        {vista === "agenda" && <Agenda />}
        {vista === "admin"  && <AdminPanel />}
      </div>
    </ErrorBoundary>
  );
}

export default App;