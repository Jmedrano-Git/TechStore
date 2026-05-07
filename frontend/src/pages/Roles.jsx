import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import { useToast } from "../context/ToastContext";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const toast = useToast();

  const load = () => api.get("/rbac/roles/").then((r) => setRoles(r.data));
  useEffect(() => { load(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.post("/rbac/roles/", form);
      setForm({ nombre: "", descripcion: "" });
      toast.success(`Rol "${form.nombre}" creado`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al crear rol");
    }
  };

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar el rol "${nombre}"?`)) return;
    try {
      await api.delete(`/rbac/roles/${id}/`);
      toast.success("Rol eliminado");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "No se pudo eliminar");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-ios-gray-700 tracking-tight">Gestión de Roles</h1>

      <Card title="Crear nuevo rol" subtitle="Solo el Administrador puede crear roles (RBAC)">
        <form onSubmit={crear} className="grid md:grid-cols-3 gap-3">
          <input required placeholder="Nombre del rol" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition" />
          <input placeholder="Descripción" value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition" />
          <button className="bg-ios-blue hover:bg-ios-blue/90 text-white rounded-xl font-semibold transition">
            Crear rol
          </button>
        </form>
      </Card>

      <Card title="Roles existentes" subtitle={`${roles.length} roles definidos`}>
        <div className="space-y-2">
          {roles.map((r) => (
            <div key={r.id} className="flex items-center justify-between bg-ios-gray-50 rounded-xl px-4 py-3 hover:bg-ios-gray-100 transition">
              <div>
                <p className="font-semibold text-ios-gray-700">{r.nombre}</p>
                <p className="text-xs text-ios-gray-400">{r.descripcion || "Sin descripción"}</p>
              </div>
              <button onClick={() => eliminar(r.id, r.nombre)}
                className="text-ios-red hover:bg-ios-red/10 px-3 py-1.5 rounded-lg text-sm font-medium transition">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}