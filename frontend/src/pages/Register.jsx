import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", nombre_completo: "", tienda: "" });
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const nav = useNavigate();

  useEffect(() => {
    api.get("/rbac/tiendas/").then((r) => setTiendas(r.data)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register/", form);
      toast.success("Cuenta creada. Espera a que un admin te asigne un rol.");
      setTimeout(() => nav("/login"), 1500);
    } catch (e) {
      const data = e.response?.data;
      const msg = typeof data === "object"
        ? Object.values(data).flat().join(" ")
        : "Error en el registro";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue/5">
      <div className="w-full max-w-md animate-slide-up">
        <form onSubmit={submit} className="bg-white border border-ios-gray-200/70 rounded-2xl shadow-apple-lg p-8">
          <h1 className="text-2xl font-bold text-ios-gray-700 mb-1">Crear cuenta</h1>
          <p className="text-sm text-ios-gray-400 mb-6">Tu cuenta requerirá aprobación del administrador</p>

          <input required placeholder="Nombre completo" value={form.nombre_completo} onChange={set("nombre_completo")}
            className="w-full bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-3 mb-3 focus:bg-white focus:border-ios-blue transition" />
          <input required type="email" placeholder="Correo electrónico" value={form.email} onChange={set("email")}
            className="w-full bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-3 mb-3 focus:bg-white focus:border-ios-blue transition" />
          <input required type="password" placeholder="Contraseña segura" value={form.password} onChange={set("password")}
            className="w-full bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-3 mb-1 focus:bg-white focus:border-ios-blue transition" />
          <p className="text-xs text-ios-gray-400 mb-3 px-1">Mínimo 8 caracteres, una mayúscula, número y carácter especial</p>

          <select required value={form.tienda} onChange={set("tienda")}
            className="w-full bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-3 mb-6 focus:bg-white focus:border-ios-blue transition">
            <option value="">Tienda asignada…</option>
            {tiendas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>

          <button disabled={loading}
            className="w-full bg-ios-blue hover:bg-ios-blue/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold shadow-md shadow-ios-blue/20 transition">
            {loading ? "Creando…" : "Crear cuenta"}
          </button>

          <p className="text-sm text-ios-gray-400 mt-6 text-center">
            <Link to="/login" className="text-ios-blue font-medium hover:underline">Volver al inicio de sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}