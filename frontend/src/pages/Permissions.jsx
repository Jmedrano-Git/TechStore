import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import { useToast } from "../context/ToastContext";

const ACCIONES = [
  { key: "SELECT", label: "Ver" },
  { key: "INSERT", label: "Crear" },
  { key: "UPDATE", label: "Editar" },
  { key: "UPDATE_STOCK", label: "Editar stock" },
  { key: "DELETE", label: "Eliminar" },
];

const RECURSOS = [
  { key: "Producto", label: "Producto", acciones: ["SELECT", "INSERT", "UPDATE", "UPDATE_STOCK", "DELETE"] },
  { key: "Usuario", label: "Usuario", acciones: ["SELECT", "INSERT", "UPDATE", "DELETE"] },
  { key: "Role", label: "Rol", acciones: ["SELECT", "INSERT", "UPDATE", "DELETE"] },
  { key: "AuditLog", label: "Auditoría", acciones: ["SELECT"] },
];

export default function Permissions() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const toast = useToast();

  const load = async () => {
    const [r1, r2] = await Promise.all([
      api.get("/rbac/roles/"),
      api.get("/rbac/permisos/"),
    ]);
    setRoles(r1.data.filter((r) => r.nombre !== "Admin"));
    setPermisos(r2.data);
  };

  useEffect(() => { load(); }, []);

  const getPermiso = (rolId, accion, recurso) =>
    permisos.find((p) => p.rol === rolId && p.accion === accion && p.recurso === recurso);

  const togglePermiso = async (rolId, accion, recurso) => {
    const p = getPermiso(rolId, accion, recurso);
    if (!p) {
      toast.error("Permiso no encontrado");
      return;
    }
    try {
      const r = await api.patch(`/rbac/permisos/${p.id}/`, { permitido: !p.permitido });
      setPermisos((prev) => prev.map((x) => (x.id === p.id ? r.data : x)));
      toast.success("Permiso actualizado");
    } catch {
      toast.error("Error al actualizar permiso");
    }
  };

  const reset = async () => {
    if (!confirm("¿Restablecer la matriz a los valores por defecto del documento?")) return;
    try {
      await api.post("/rbac/permisos/reset/");
      toast.success("Permisos restablecidos");
      load();
    } catch {
      toast.error("Error al restablecer");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ios-gray-700 tracking-tight">Matriz de Permisos</h1>
          <p className="text-ios-gray-400 mt-1">El Administrador siempre tiene todos los permisos. Los demás roles son editables.</p>
        </div>
        <button onClick={reset}
          className="bg-white border border-ios-gray-200 hover:bg-ios-gray-100 text-ios-gray-700 px-4 py-2 rounded-xl font-medium transition">
          ↺ Restablecer por defecto
        </button>
      </div>

      {RECURSOS.map((rec) => (
        <Card key={rec.key} title={`Recurso: ${rec.label}`} subtitle="Marca/desmarca cada celda para autorizar la acción al rol">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ios-gray-400 border-b border-ios-gray-200">
                  <th className="py-3 font-medium w-32">Rol</th>
                  {rec.acciones.map((a) => (
                    <th key={a} className="font-medium text-center px-2">
                      {ACCIONES.find((x) => x.key === a)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((rol) => (
                  <tr key={rol.id} className="border-b border-ios-gray-100 last:border-0 hover:bg-ios-gray-50 transition">
                    <td className="py-3 font-semibold text-ios-gray-700">{rol.nombre}</td>
                    {rec.acciones.map((a) => {
                      const p = getPermiso(rol.id, a, rec.key);
                      const permitido = p?.permitido;
                      return (
                        <td key={a} className="text-center px-2">
                          <button
                            onClick={() => togglePermiso(rol.id, a, rec.key)}
                            className={`w-12 h-7 rounded-full transition relative ${
                              permitido ? "bg-ios-green" : "bg-ios-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${
                                permitido ? "left-[1.625rem]" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}