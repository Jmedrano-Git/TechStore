import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/abac/logs/").then((r) => setLogs(r.data)).catch(() => {});
  }, []);

  const colorAccion = (a) => ({
    SELECT: "bg-ios-blue/10 text-ios-blue",
    INSERT: "bg-ios-green/10 text-ios-green",
    UPDATE: "bg-ios-orange/10 text-ios-orange",
    DELETE: "bg-ios-red/10 text-ios-red",
  }[a] || "bg-ios-gray-100 text-ios-gray-500");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-ios-gray-700 tracking-tight">Registro de Auditoría</h1>
        <p className="text-ios-gray-400 mt-1">{logs.length} eventos registrados</p>
      </div>

      <Card title="Eventos recientes" subtitle="Cada acción sobre productos queda registrada con su evaluación ABAC">
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 bg-ios-gray-50 rounded-xl px-4 py-3">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${colorAccion(l.accion)} min-w-[60px] text-center`}>
                {l.accion}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ios-gray-700 truncate">
                  {l.usuario_email || "anónimo"} → {l.recurso}
                </p>
                <p className="text-xs text-ios-gray-400 truncate">{l.detalle || "—"}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                l.permitido ? "bg-ios-green/10 text-ios-green" : "bg-ios-red/10 text-ios-red"
              }`}>
                {l.permitido ? "✓ Permitido" : "✕ Denegado"}
              </span>
              <span className="text-xs text-ios-gray-400 whitespace-nowrap">
                {new Date(l.fecha).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-ios-gray-400 py-8">No hay eventos aún</p>}
        </div>
      </Card>
    </div>
  );
}