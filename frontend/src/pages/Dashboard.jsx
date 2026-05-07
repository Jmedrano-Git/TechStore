import { useEffect, useState } from "react";
import api from "../api/client";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Products() {
  const { can, user } = useAuth();
  const [productos, setProductos] = useState([]);
  const [tiendas, setTiendas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", precio: 0, stock: 0,
    categoria: "", tienda: user?.tienda || "", es_premium: false,
  });
  const toast = useToast();

  const puedeCrear = can("INSERT", "Producto");
  const puedeEditar = can("UPDATE", "Producto");
  const puedeEditarStock = can("UPDATE_STOCK", "Producto");
  const puedeEliminar = can("DELETE", "Producto");

  const load = () => {
    api.get("/abac/productos/").then((r) => setProductos(r.data));
    api.get("/rbac/tiendas/").then((r) => setTiendas(r.data));
  };
  useEffect(() => { load(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    try {
      await api.post("/abac/productos/", form);
      toast.success("Producto creado");
      setShowForm(false);
      setForm({ nombre: "", descripcion: "", precio: 0, stock: 0, categoria: "", tienda: user?.tienda || "", es_premium: false });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error al crear");
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await api.delete(`/abac/productos/${id}/`);
      toast.success("Producto eliminado");
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    }
  };

  const cambiarStock = async (p, delta) => {
    const nuevo = p.stock + delta;
    if (nuevo < 0) return;
    try {
      await api.patch(`/abac/productos/${p.id}/`, { stock: nuevo });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ios-gray-700 tracking-tight">Productos</h1>
          <p className="text-ios-gray-400 mt-1">{productos.length} producto(s) visibles</p>
        </div>
        {puedeCrear && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-ios-blue hover:bg-ios-blue/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-ios-blue/20 transition">
            {showForm ? "Cancelar" : "+ Nuevo producto"}
          </button>
        )}
      </div>

      {showForm && puedeCrear && (
        <Card title="Crear producto" subtitle="Las reglas ABAC validarán los datos al guardar">
          <form onSubmit={crear} className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Nombre" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition" />
            <input required placeholder="Categoría" value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition" />
            <input required type="number" step="0.01" placeholder="Precio" value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition" />
            <input required type="number" placeholder="Stock" value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition" />
            <select required value={form.tienda} onChange={(e) => setForm({ ...form, tienda: e.target.value })}
              className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition">
              <option value="">Tienda…</option>
              {tiendas.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-ios-gray-100 rounded-xl cursor-pointer">
              <input type="checkbox" checked={form.es_premium}
                onChange={(e) => setForm({ ...form, es_premium: e.target.checked })}
                className="w-4 h-4 accent-ios-blue" />
              <span className="text-sm font-medium text-ios-gray-600">Producto premium ⭐</span>
            </label>
            <textarea placeholder="Descripción (opcional)" value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="bg-ios-gray-100 border-2 border-transparent rounded-xl px-4 py-2.5 focus:bg-white focus:border-ios-blue transition md:col-span-2" />
            <button className="bg-ios-blue hover:bg-ios-blue/90 text-white rounded-xl font-semibold py-2.5 md:col-span-2 transition">
              Guardar producto
            </button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((p) => (
          <div key={p.id} className="bg-white border border-ios-gray-200/70 rounded-2xl shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden">
            <div className={`h-2 ${p.es_premium ? "bg-gradient-to-r from-ios-orange to-ios-pink" : "bg-ios-blue"}`} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-ios-gray-700 text-lg leading-tight">{p.nombre}</h3>
                  <p className="text-xs text-ios-gray-400 mt-0.5">{p.categoria} · {p.tienda_nombre}</p>
                </div>
                {p.es_premium && (
                  <span className="bg-ios-orange/10 text-ios-orange text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap">⭐ Premium</span>
                )}
              </div>

              {p.descripcion && (
                <p className="text-sm text-ios-gray-500 mt-2 line-clamp-2">{p.descripcion}</p>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-ios-gray-100">
                <div>
                  <p className="text-xs text-ios-gray-400">Precio</p>
                  <p className="text-2xl font-bold text-ios-gray-700">S/ {Number(p.precio).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ios-gray-400">Stock</p>
                  {puedeEditarStock ? (
                    <div className="inline-flex items-center gap-2 mt-1">
                      <button onClick={() => cambiarStock(p, -1)}
                        className="w-7 h-7 rounded-full bg-ios-gray-100 hover:bg-ios-gray-200 transition font-bold">−</button>
                      <span className="font-semibold w-8 text-center">{p.stock}</span>
                      <button onClick={() => cambiarStock(p, 1)}
                        className="w-7 h-7 rounded-full bg-ios-gray-100 hover:bg-ios-gray-200 transition font-bold">+</button>
                    </div>
                  ) : (
                    <p className="font-semibold text-ios-gray-700">{p.stock}</p>
                  )}
                </div>
              </div>

              {puedeEliminar && (
                <button onClick={() => eliminar(p.id)}
                  className="mt-4 w-full text-ios-red hover:bg-ios-red/10 px-3 py-2 rounded-lg text-sm font-medium transition">
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
        {productos.length === 0 && (
          <div className="col-span-full bg-white border border-ios-gray-200/70 rounded-2xl shadow-apple p-12 text-center">
            <p className="text-ios-gray-400">No hay productos visibles</p>
          </div>
        )}
      </div>
    </div>
  );
}