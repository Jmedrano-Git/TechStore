import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPermisos = async () => {
    try {
      const r = await api.get("/rbac/permisos/mis-permisos/");
      setPermisos(r.data);
    } catch {
      setPermisos([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me/")
      .then(async (r) => {
        setUser(r.data);
        await cargarPermisos();
      })
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const saveTokens = async (data) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const me = await api.get("/auth/me/");
    setUser(me.data);
    await cargarPermisos();
    return me.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPermisos([]);
  };

  const role = user ? (user.is_superuser ? "Admin" : user.rol_nombre) : null;

  // Helper: ¿puedo hacer esta acción sobre este recurso?
  const can = (accion, recurso) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return permisos.some((p) => p.accion === accion && p.recurso === recurso && p.permitido);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveTokens, logout, role, can, permisos, cargarPermisos }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);