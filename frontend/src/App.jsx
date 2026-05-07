import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MfaVerify from "./pages/MfaVerify";
import Dashboard from "./pages/Dashboard";
import Roles from "./pages/Roles";
import Users from "./pages/Users";
import Products from "./pages/Products";
import AuditLogs from "./pages/AuditLogs";
import Permissions from "./pages/Permissions";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/mfa" element={<MfaVerify />} />

      <Route path="/" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/productos" element={
        <ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute roles={["Admin", "Auditor"]}><Layout><AuditLogs /></Layout></ProtectedRoute>
      } />
      <Route path="/roles" element={
        <ProtectedRoute roles={["Admin"]}><Layout><Roles /></Layout></ProtectedRoute>
      } />
      <Route path="/usuarios" element={
        <ProtectedRoute roles={["Admin"]}><Layout><Users /></Layout></ProtectedRoute>
      } />
      <Route path="/permisos" element={
        <ProtectedRoute roles={["Admin"]}><Layout><Permissions /></Layout></ProtectedRoute>
      } />
    </Routes>
  );
}