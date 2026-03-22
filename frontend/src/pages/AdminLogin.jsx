import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, LogIn, AlertCircle, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = "/logo.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/admin/panel");
      return;
    }

    // Check if admin exists
    checkAdminSetup();
  }, [navigate]);

  const checkAdminSetup = async () => {
    try {
      const response = await axios.get(`${API}/admin/check-setup`);
      setNeedsSetup(!response.data.admin_exists);
    } catch (err) {
      console.error("Error checking admin setup:", err);
    } finally {
      setCheckingSetup(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);

    try {
      if (needsSetup) {
        // Create admin user
        await axios.post(`${API}/admin/setup`, { username, password });
        toast.success("Usuario administrador creado exitosamente");
        setNeedsSetup(false);
      }

      // Login
      const response = await axios.post(`${API}/admin/login`, { username, password });
      localStorage.setItem("admin_token", response.data.access_token);
      localStorage.setItem("admin_username", response.data.username);
      toast.success("Inicio de sesión exitoso");
      navigate("/admin/panel");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Error al iniciar sesión";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] bg-[#0F0F0F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <a href="/" className="flex items-center gap-4" data-testid="header-logo-link">
            <img 
              src={LOGO_URL} 
              alt="CONER Logo" 
              className="h-10 w-auto"
            />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#0F0F0F] border-[#2A2A2A] gold-border-glow">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <CardTitle className="font-heading text-2xl text-[#F5F5F5]">
                {needsSetup ? "Configurar Administrador" : "Panel de Administración"}
              </CardTitle>
              <CardDescription className="text-[#A3A3A3]">
                {needsSetup 
                  ? "Crea tu usuario administrador para acceder al panel" 
                  : "Ingresa tus credenciales para continuar"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37]">
                    Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
                    <Input
                      data-testid="username-input"
                      type="text"
                      placeholder="Nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-14 pl-12 pr-6 rounded-sm transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37]">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
                    <Input
                      data-testid="password-input"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-14 pl-12 pr-6 rounded-sm transition-all"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-sm"
                    data-testid="error-container"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-400 text-sm" data-testid="error-message">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  data-testid="login-button"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] font-bold px-8 py-6 h-14 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 btn-lift"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {needsSetup ? "Creando..." : "Iniciando..."}
                    </>
                  ) : needsSetup ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Crear Administrador
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </form>

              {/* Back Link */}
              <div className="mt-6 text-center">
                <a 
                  href="/" 
                  className="text-[#A3A3A3] hover:text-[#D4AF37] transition-colors text-sm"
                  data-testid="back-home-link"
                >
                  ← Volver al inicio
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
