import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Settings, LogOut, Save, Link, Key, Clock, 
  AlertCircle, Loader2, CheckCircle, BarChart3, 
  Search, XCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = "/logo.png";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    api_url: "",
    api_key: "",
    timeout_seconds: 30,
  });
  const [stats, setStats] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const storedUsername = localStorage.getItem("admin_username");
    
    if (!token) {
      navigate("/admin");
      return;
    }

    setUsername(storedUsername || "Admin");
    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [configRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/config`, { headers }),
        axios.get(`${API}/admin/stats`, { headers }),
      ]);

      setConfig({
        api_url: configRes.data.api_url || "",
        api_key: configRes.data.api_key || "",
        timeout_seconds: configRes.data.timeout_seconds || 30,
      });
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        toast.error("Error al cargar la configuración");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      await axios.put(
        `${API}/admin/config`,
        config,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Configuración guardada exitosamente");
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        toast.error("Error al guardar la configuración");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    navigate("/admin");
    toast.info("Sesión cerrada");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" data-testid="header-logo-link">
              <img 
                src={LOGO_URL} 
                alt="CONER Logo" 
                className="h-10 w-auto"
              />
            </a>
            <div className="h-6 w-px bg-[#2A2A2A]" />
            <span className="text-[#D4AF37] font-medium">Panel de Administración</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#A3A3A3] text-sm">
              Bienvenido, <span className="text-[#F5F5F5]">{username}</span>
            </span>
            <Button
              data-testid="logout-button"
              onClick={handleLogout}
              variant="ghost"
              className="text-[#A3A3A3] hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="config" className="space-y-8">
            <TabsList className="bg-[#0F0F0F] border border-[#2A2A2A] p-1">
              <TabsTrigger 
                value="config" 
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                data-testid="config-tab"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="data-[state=active]:bg-[#D4AF37] data-[state=active]:text-black"
                data-testid="stats-tab"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="config">
              <Card className="bg-[#0F0F0F] border-[#2A2A2A]">
                <CardHeader>
                  <CardTitle className="font-heading text-xl text-[#D4AF37] flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuración de API
                  </CardTitle>
                  <CardDescription className="text-[#A3A3A3]">
                    Configura los parámetros de conexión con la API de historial laboral
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* API URL */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37] flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      URL de la API
                    </label>
                    <Input
                      data-testid="api-url-input"
                      type="url"
                      placeholder="https://api.example.com/endpoint"
                      value={config.api_url}
                      onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
                      className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-14 px-6 rounded-sm transition-all font-mono text-sm"
                    />
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37] flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Key
                    </label>
                    <Input
                      data-testid="api-key-input"
                      type="password"
                      placeholder="••••••••••••••••"
                      value={config.api_key}
                      onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                      className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-14 px-6 rounded-sm transition-all"
                    />
                  </div>

                  {/* Timeout */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37] flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeout (segundos)
                    </label>
                    <Input
                      data-testid="timeout-input"
                      type="number"
                      min="5"
                      max="120"
                      value={config.timeout_seconds}
                      onChange={(e) => setConfig({ ...config, timeout_seconds: parseInt(e.target.value) || 30 })}
                      className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-14 px-6 rounded-sm transition-all max-w-xs"
                    />
                    <p className="text-[#A3A3A3] text-sm">
                      Tiempo máximo de espera para las consultas (5-120 segundos)
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-4">
                    <Button
                      data-testid="save-config-button"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#D4AF37] text-black hover:bg-[#B5952F] font-bold px-8 py-6 h-14 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 btn-lift"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Guardar Configuración
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats">
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard 
                    title="Total de Consultas"
                    value={stats?.total_queries || 0}
                    icon={<Search className="w-6 h-6" />}
                    color="gold"
                  />
                  <StatsCard 
                    title="Consultas Exitosas"
                    value={stats?.successful_queries || 0}
                    icon={<CheckCircle className="w-6 h-6" />}
                    color="green"
                  />
                  <StatsCard 
                    title="Consultas Fallidas"
                    value={stats?.failed_queries || 0}
                    icon={<XCircle className="w-6 h-6" />}
                    color="red"
                  />
                </div>

                {/* Recent Queries */}
                <Card className="bg-[#0F0F0F] border-[#2A2A2A]">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl text-[#D4AF37] flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Consultas Recientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.recent_queries?.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recent_queries.map((query, index) => (
                          <div 
                            key={query.id || index}
                            className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]"
                          >
                            <div className="flex items-center gap-4">
                              {query.success ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <div>
                                <p className="font-mono text-sm text-[#F5F5F5]">{query.curp}</p>
                                {query.error_message && (
                                  <p className="text-xs text-red-400 mt-1">{query.error_message}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-[#A3A3A3] text-xs">
                              {new Date(query.timestamp).toLocaleString('es-MX')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-[#A3A3A3]">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay consultas registradas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }) {
  const colorClasses = {
    gold: "text-[#D4AF37] bg-[#D4AF37]/10",
    green: "text-green-500 bg-green-500/10",
    red: "text-red-500 bg-red-500/10",
  };

  return (
    <Card className="bg-[#0F0F0F] border-[#2A2A2A]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#A3A3A3] text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-[#F5F5F5]">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
