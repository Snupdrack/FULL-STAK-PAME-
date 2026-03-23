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

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem("user_token");
    if (token) {
      navigate("/");
      return;
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Por favor complete todos los campos");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/register" : "/login";
      const response = await axios.post(`${API}${endpoint}`, { username, password });
      localStorage.setItem("user_token", response.data.access_token);
      localStorage.setItem("user_username", response.data.username);
      toast.success(isRegister ? "Registro exitoso" : "Inicio de sesión exitoso");
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || (isRegister ? "Error al registrarse" : "Error al iniciar sesión");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#0F0F0F] border-[#2A2A2A] shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                  <Lock className="w-8 h-8 text-[#D4AF37]" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-[#F5F5F5]">
                {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
              </CardTitle>
              <CardDescription className="text-[#A0A0A0]">
                {isRegister ? "Regístrate para acceder al sistema" : "Ingresa tus credenciales para continuar"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-[#F5F5F5] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Usuario
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5] focus:border-[#D4AF37]"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[#F5F5F5] flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Contraseña
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-[#F5F5F5] focus:border-[#D4AF37]"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#B8952A] text-[#050505] font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isRegister ? "Registrando..." : "Iniciando sesión..."}
                    </>
                  ) : (
                    <>
                      {isRegister ? <UserPlus className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
                      {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-[#D4AF37] hover:text-[#B8952A] text-sm underline"
                >
                  {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}