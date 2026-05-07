import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login/", { email, password });
      if (r.data.mfa_required) {
        toast.info(r.data.mensaje);
        nav(`/mfa?user_id=${r.data.user_id}&email=${encodeURIComponent(email)}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue/5">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-ios-blue to-ios-purple items-center justify-center shadow-apple-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v3m0-3h3m-3 0H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-ios-gray-700 tracking-tight">TechStore</h1>
          <p className="text-ios-gray-400 text-sm mt-1">Panel de Seguridad</p>
        </div>

        <form onSubmit={submit} className="bg-white border border-ios-gray-200/70 rounded-2xl shadow-apple-lg p-8">
          <h2 className="text-xl font-semibold text-ios-gray-700 mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-ios-gray-400 mb-6">Ingresa tus credenciales para continuar</p>

          <label className="block text-sm font-medium text-ios-gray-600 mb-1.5">Correo</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="w-full bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-3 mb-4 focus:bg-white focus:border-ios-blue transition" />

          <label className="block text-sm font-medium text-ios-gray-600 mb-1.5">Contraseña</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-3 mb-6 focus:bg-white focus:border-ios-blue transition" />

          <button disabled={loading}
            className="w-full bg-ios-blue hover:bg-ios-blue/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold shadow-md shadow-ios-blue/20 transition">
            {loading ? "Verificando…" : "Continuar"}
          </button>

          <p className="text-sm text-ios-gray-400 mt-6 text-center">
            ¿No tienes cuenta? <Link to="/register" className="text-ios-blue font-medium hover:underline">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}