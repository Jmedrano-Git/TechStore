import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const link = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? "bg-ios-blue text-white shadow-md shadow-ios-blue/30"
      : "text-ios-gray-500 hover:bg-ios-gray-100 hover:text-ios-gray-700"
  }`;

const Icon = ({ d }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

export default function Sidebar() {
  const { user, logout, role, can } = useAuth();
  const nav = useNavigate();

  const verAuditoria = can("SELECT", "AuditLog");
  const gestionarUsuarios = can("UPDATE", "Usuario") || user?.is_superuser;
  const gestionarRoles = can("INSERT", "Role") || user?.is_superuser;
  const gestionarPermisos = user?.is_superuser || role === "Admin";

  return (
    <aside className="w-64 bg-white border-r border-ios-gray-200/70 min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-ios-gray-200/50">
        <h1 className="text-xl font-bold text-ios-gray-700 tracking-tight">TechStore</h1>
        <p className="text-xs text-ios-gray-400 mt-0.5">Panel de Seguridad</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/" end className={link}>
          <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          Dashboard
        </NavLink>

        <NavLink to="/productos" className={link}>
          <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          Productos
        </NavLink>

        {verAuditoria && (
          <NavLink to="/logs" className={link}>
            <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            Auditoría
          </NavLink>
        )}

        {(gestionarRoles || gestionarUsuarios || gestionarPermisos) && (
          <>
            <div className="text-xs text-ios-gray-400 uppercase tracking-wider mt-6 mb-2 px-4 font-semibold">
              Administración
            </div>
            {gestionarRoles && (
              <NavLink to="/roles" className={link}>
                <Icon d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                Roles
              </NavLink>
            )}
            {gestionarUsuarios && (
              <NavLink to="/usuarios" className={link}>
                <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                Usuarios
              </NavLink>
            )}
            {gestionarPermisos && (
              <NavLink to="/permisos" className={link}>
                <Icon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                Permisos
              </NavLink>
            )}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-ios-gray-200/50">
        <div className="bg-ios-gray-100 rounded-xl p-3 mb-2">
          <p className="text-sm font-semibold text-ios-gray-700 truncate">{user?.nombre_completo || user?.email}</p>
          <p className="text-xs text-ios-gray-400 truncate">{user?.email}</p>
          <span className="inline-block mt-2 text-xs font-semibold bg-ios-blue/10 text-ios-blue px-2 py-0.5 rounded-md">
            {role || "sin rol"}
          </span>
        </div>
        <button
          onClick={() => { logout(); nav("/login"); }}
          className="w-full bg-white border border-ios-gray-200 hover:bg-ios-gray-100 text-ios-gray-700 text-sm py-2 rounded-xl font-medium transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}