import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, role } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-ios-gray-400">Cargando…</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-apple p-8 max-w-md text-center">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-ios-gray-700 mb-2">Acceso restringido</h2>
          <p className="text-ios-gray-500 text-sm">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }
  return children;
}