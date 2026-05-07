import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MfaVerify() {
  const [params] = useSearchParams();
  const userId = params.get("user_id");
  const email = params.get("email");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const { saveTokens } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const onChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(text)) {
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  };

  const submit = async (e) => {
    e?.preventDefault();
    const codigo = digits.join("");
    if (codigo.length !== 6) return;
    setLoading(true);
    try {
      const r = await api.post("/auth/login/mfa/", { user_id: userId, codigo });
      await saveTokens(r.data);
      toast.success("Bienvenido");
      nav("/");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Código inválido");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async () => {
    try {
      await api.post("/auth/login/reenviar/", { user_id: userId });
      toast.info("Código reenviado a tu correo");
    } catch {
      toast.error("No se pudo reenviar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-ios-gray-50 via-white to-ios-blue/5">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-white border border-ios-gray-200/70 rounded-2xl shadow-apple-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex w-14 h-14 rounded-full bg-ios-blue/10 items-center justify-center mb-3">
              <svg className="w-7 h-7 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ios-gray-700">Verifica tu identidad</h1>
            <p className="text-sm text-ios-gray-400 mt-2">
              Enviamos un código de 6 dígitos a<br />
              <span className="font-medium text-ios-gray-600">{email}</span>
            </p>
          </div>

          <form onSubmit={submit}>
            <div className="flex justify-center gap-2 mb-6" onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => onChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-ios-gray-100 border-2 border-transparent rounded-xl focus:bg-white focus:border-ios-blue transition"
                />
              ))}
            </div>

            <button type="submit" disabled={loading || digits.join("").length !== 6}
              className="w-full bg-ios-blue hover:bg-ios-blue/90 disabled:opacity-40 text-white py-3 rounded-xl font-semibold shadow-md shadow-ios-blue/20 transition">
              {loading ? "Verificando…" : "Verificar"}
            </button>
          </form>

          <div className="text-center mt-5">
            <button onClick={reenviar} className="text-sm text-ios-blue hover:underline">
              ¿No recibiste el código? Reenviar
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-ios-gray-400 mt-4">
          🔒 El código expira en 5 minutos · Máximo 3 intentos
        </p>
      </div>
    </div>
  );
}