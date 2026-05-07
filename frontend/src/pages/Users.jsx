import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import { useToast } from "../context/ToastContext";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const toast = useToast();

  const load = () => {
    api.get("/rbac/usuarios/").then((r) => setUsers(r.data));
    api.get("/rbac/roles/").then((r) => setRoles(r.data));
  };
  useEffect(() => { load(); }, []);

  const cambiarRol = async (userId, rolId) => {
    try {
      await api.post(`/rbac/usuarios/${userId}/asignar_rol/`, {
        rol_id: rolId === "" ? null : Number(rolId),
      });
      toast.success("Rol actualizado");
      load();
    } catch {
      toast.error("Error al asignar rol");
    }
  };

  const desbloquear = async (id) => {
    try {
      await api.post(`/rbac/usuarios/${id}/desbloquear/`);
      toast.success("Usuario desbloqueado");
      load();
    } catch {
      toast.error("Error");
    }
  };

  const sinRol = users.filter((u) => !u.rol).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ios-gray-700 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-ios-gray-400 mt-1">{users.length} usuarios registrados</p>
        </div>
        {sinRol > 0 && (
          <span className="bg-ios-orange/10 text-ios-orange text-sm font-semibold px-3 py-1.5 rounded-full">
            {sinRol} sin rol asignado
          </span>
        )}
      </div>

      <Card title="Usuarios registrados" subtitle="Cada usuario solo puede tener un rol. Los superusuarios no aparecen aquí.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ios-gray-400 border-b border-ios-gray-200">
              <tr>
                <th className="py-3 font-medium">Usuario</th>
                <th className="font-medium">Tienda</th>
                <th className="font-medium">Rol</th>
                <th className="font-medium">Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ios-gray-100 last:border-0 hover:bg-ios-gray-50 transition">
                  <td className="py-3">
                    <p className="font-semibold text-ios-gray-700">{u.nombre_completo}</p>
                    <p className="text-xs text-ios-gray-400">{u.email}</p>
                  </td>
                  <td className="text-ios-gray-600">{u.tienda_nombre || "—"}</td>
                  <td>
                    <select value={u.rol || ""} onChange={(e) => cambiarRol(u.id, e.target.value)}
                      className="bg-ios-gray-100 border-2 border-transparent rounded-lg px-3 py-1.5 text-sm focus:bg-white focus:border-ios-blue transition">
                      <option value="">— sin rol —</option>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </td>
                  <td>
                    {u.bloqueado ? (
                      <span className="inline-flex items-center gap-1 bg-ios-red/10 text-ios-red text-xs font-semibold px-2.5 py-1 rounded-md">
                        🔒 Bloqueado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-ios-green/10 text-ios-green text-xs font-semibold px-2.5 py-1 rounded-md">
                        ✓ Activo
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {u.bloqueado && (
                      <button onClick={() => desbloquear(u.id)}
                        className="text-ios-blue hover:bg-ios-blue/10 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                        Desbloquear
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-ios-gray-400">Aún no hay usuarios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}