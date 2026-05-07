import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  }, []);

  const toast = {
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
    info: (m) => show(m, "info"),
    warning: (m) => show(m, "warning"),
  };

  const styles = {
    success: "bg-white border-l-4 border-ios-green",
    error: "bg-white border-l-4 border-ios-red",
    info: "bg-white border-l-4 border-ios-blue",
    warning: "bg-white border-l-4 border-ios-orange",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ⓘ",
    warning: "⚠",
  };

  const iconColors = {
    success: "text-ios-green",
    error: "text-ios-red",
    info: "text-ios-blue",
    warning: "text-ios-orange",
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles[t.type]} pointer-events-auto rounded-xl shadow-apple-lg px-5 py-4 min-w-[320px] max-w-md flex items-start gap-3 animate-slide-in-right`}
          >
            <div className={`${iconColors[t.type]} text-xl font-bold leading-none mt-0.5`}>
              {icons[t.type]}
            </div>
            <p className="text-sm text-ios-gray-700 font-medium flex-1">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);