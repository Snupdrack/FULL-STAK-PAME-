import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, User, Calendar, MapPin, Shield, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LOGO_URL = "/logo.png";

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#D4AF37",
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#D4AF37",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 8,
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: "#1a1a1a",
    fontFamily: "Helvetica-Bold",
  },
  statusBadge: {
    backgroundColor: "#065F46",
    color: "#FFFFFF",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    alignSelf: "flex-start",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  footerText: {
    fontSize: 8,
    color: "#999999",
  },
  watermark: {
    fontSize: 10,
    color: "#D4AF37",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Helvetica-Bold",
  },
});

// PDF Document Component
const HistorialPDF = ({ data, curp }) => {
  const now = new Date().toLocaleString("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.title}>Historial Laboral IMSS</Text>
            <Text style={pdfStyles.subtitle}>Documento generado el {now}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "#D4AF37" }}>CONER</Text>
            <Text style={{ fontSize: 8, color: "#666666" }}>Consultores Especializados</Text>
            <Text style={{ fontSize: 8, color: "#666666" }}>en Retiros</Text>
          </View>
        </View>

        {data.nss?.info && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Información Personal</Text>
            <View style={pdfStyles.infoGrid}>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Nombre Completo</Text>
                <Text style={pdfStyles.infoValue}>
                  {`${data.nss.info.nombres || ""} ${data.nss.info.apellido_paterno || ""} ${data.nss.info.apellido_materno || ""}`}
                </Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>CURP</Text>
                <Text style={pdfStyles.infoValue}>{data.nss.info.curp || curp}</Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Número de Seguridad Social</Text>
                <Text style={pdfStyles.infoValue}>{data.nss.info.numero_seguridad_social || "N/A"}</Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Fecha de Nacimiento</Text>
                <Text style={pdfStyles.infoValue}>{data.nss.info.fecha_nacimiento || "N/A"}</Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Lugar de Nacimiento</Text>
                <Text style={pdfStyles.infoValue}>{data.nss.info.lugar_nacimiento || "N/A"}</Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Sexo</Text>
                <Text style={pdfStyles.infoValue}>{data.nss.info.sexo || "N/A"}</Text>
              </View>
            </View>
          </View>
        )}

        {data.nss?.status && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Estado NSS</Text>
            <View style={pdfStyles.infoGrid}>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Última Actualización</Text>
                <Text style={pdfStyles.infoValue}>{data.nss.status.ultima_actualizacion || "N/A"}</Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Estado</Text>
                <View style={pdfStyles.statusBadge}>
                  <Text style={{ color: "#FFFFFF", fontSize: 9 }}>{data.nss.status.mensaje || "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {data.historial?.status && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Estado del Historial</Text>
            <View style={pdfStyles.infoGrid}>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Última Actualización</Text>
                <Text style={pdfStyles.infoValue}>{data.historial.status.ultima_actualizacion || "N/A"}</Text>
              </View>
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Estado</Text>
                <View style={pdfStyles.statusBadge}>
                  <Text style={{ color: "#FFFFFF", fontSize: 9 }}>{data.historial.status.mensaje || "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            Este documento es de carácter informativo. La información presentada corresponde
            a los datos registrados en el sistema del IMSS.
          </Text>
          <Text style={pdfStyles.watermark}>CONER - Consultores Especializados en Retiros</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function HomePage() {
  const [curp, setCurp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fileName = `historial_laboral_${curp}_${new Date().toISOString().split("T")[0]}.pdf`;

  const validateCURP = (value) => {
    // CURP format: 18 alphanumeric characters
    const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/i;
    return curpRegex.test(value);
  };

  const handleSearch = async () => {
    setError(null);
    setResult(null);

    if (!curp.trim()) {
      setError("Por favor ingrese su CURP");
      toast.error("Por favor ingrese su CURP");
      return;
    }

    if (curp.length !== 18) {
      setError("La CURP debe tener exactamente 18 caracteres");
      toast.error("La CURP debe tener exactamente 18 caracteres");
      return;
    }

    if (!validateCURP(curp)) {
      setError("El formato de la CURP no es válido");
      toast.error("El formato de la CURP no es válido");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/historial-laboral`, {
        curp: curp.toUpperCase(),
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("user_token")}`
        }
      });

      if (response.data.status === "success") {
        setResult(response.data.data);
        toast.success("Consulta realizada exitosamente");
      } else {
        setError(response.data.message || "Error al consultar el historial");
        toast.error(response.data.message || "Error al consultar el historial");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Error al conectar con el servicio";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Header */}
      <header className="border-b border-[#2A2A2A] bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-4" data-testid="header-logo-link">
            <img 
              src={LOGO_URL} 
              alt="CONER Logo" 
              className="h-12 w-auto logo-pulse"
            />
          </a>
          <div className="flex items-center gap-4">
            <span className="text-[#A3A3A3] text-sm">
              Bienvenido, {localStorage.getItem("user_username") || "Usuario"}
            </span>
            <Button
              onClick={() => {
                localStorage.removeItem("user_token");
                localStorage.removeItem("user_username");
                window.location.href = "/login";
              }}
              variant="outline"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050505]"
            >
              Cerrar Sesión
            </Button>
            <a 
              href="/admin" 
              className="text-[#A3A3A3] hover:text-[#D4AF37] transition-colors text-sm font-medium"
              data-testid="admin-link"
            >
              Administrador
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Consulta tu{" "}
            <span className="gold-gradient-text">Historial Laboral</span>
          </h1>
          <p className="text-[#A3A3A3] text-base md:text-lg max-w-2xl mx-auto">
            Ingresa tu CURP para consultar tu historial laboral del IMSS de manera rápida y segura.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto mb-16"
        >
          <Card className="bg-[#0F0F0F] border-[#2A2A2A] gold-border-glow">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* CURP Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-[0.2em] uppercase text-[#D4AF37]">
                    CURP *
                  </label>
                  <div className="relative">
                    <Input
                      data-testid="curp-input"
                      type="text"
                      placeholder="Ingresa tu CURP (18 caracteres)"
                      value={curp}
                      onChange={(e) => setCurp(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      maxLength={18}
                      className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] h-14 px-6 rounded-sm transition-all uppercase tracking-wider"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] text-sm">
                      {curp.length}/18
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div
                    className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-900/50 rounded-sm shake"
                    data-testid="error-container"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-400 text-sm" data-testid="error-message">{error}</span>
                  </div>
                )}

                {/* Search Button */}
                <Button
                  data-testid="search-button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] font-bold px-8 py-6 h-14 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 btn-lift"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Consultar Historial
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
              data-testid="results-section"
            >
              {/* Export Button */}
              <div className="flex justify-end mb-6">
                <PDFDownloadLink
                  document={<HistorialPDF data={result} curp={curp} />}
                  fileName={fileName}
                >
                  {({ loading: pdfLoading }) => (
                    <Button
                      data-testid="download-pdf-button"
                      disabled={pdfLoading}
                      className="bg-[#D4AF37] text-black hover:bg-[#B5952F] font-bold px-6 py-3 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 btn-lift"
                    >
                      {pdfLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </>
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>

              {/* Personal Info Card */}
              {result.nss?.info && (
                <Card className="bg-[#0F0F0F] border-[#2A2A2A] mb-6 result-enter">
                  <CardHeader className="border-b border-[#2A2A2A]">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl text-[#D4AF37]">
                      <User className="w-5 h-5" />
                      Información Personal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
                      <InfoItem 
                        icon={<User className="w-4 h-4" />}
                        label="Nombre Completo"
                        value={`${result.nss.info.nombres || ''} ${result.nss.info.apellido_paterno || ''} ${result.nss.info.apellido_materno || ''}`}
                      />
                      <InfoItem 
                        icon={<FileText className="w-4 h-4" />}
                        label="CURP"
                        value={result.nss.info.curp}
                      />
                      <InfoItem 
                        icon={<Shield className="w-4 h-4" />}
                        label="NSS"
                        value={result.nss.info.numero_seguridad_social}
                      />
                      <InfoItem 
                        icon={<Calendar className="w-4 h-4" />}
                        label="Fecha de Nacimiento"
                        value={result.nss.info.fecha_nacimiento}
                      />
                      <InfoItem 
                        icon={<MapPin className="w-4 h-4" />}
                        label="Lugar de Nacimiento"
                        value={result.nss.info.lugar_nacimiento}
                      />
                      <InfoItem 
                        icon={<User className="w-4 h-4" />}
                        label="Sexo"
                        value={result.nss.info.sexo}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historial Status Card */}
              {result.historial?.status && (
                <Card className="bg-[#0F0F0F] border-[#2A2A2A] mb-6 result-enter" style={{ animationDelay: "0.2s" }}>
                  <CardHeader className="border-b border-[#2A2A2A]">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl text-[#D4AF37]">
                      <FileText className="w-5 h-5" />
                      Estado del Historial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoItem 
                        icon={<Calendar className="w-4 h-4" />}
                        label="Última Actualización"
                        value={result.historial.status.ultima_actualizacion}
                      />
                      <InfoItem 
                        icon={<Shield className="w-4 h-4" />}
                        label="Estado"
                        value={result.historial.status.mensaje}
                        highlight={result.historial.status.mensaje === "terminado"}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* NSS Status Card */}
              {result.nss?.status && (
                <Card className="bg-[#0F0F0F] border-[#2A2A2A] result-enter" style={{ animationDelay: "0.4s" }}>
                  <CardHeader className="border-b border-[#2A2A2A]">
                    <CardTitle className="flex items-center gap-3 font-heading text-xl text-[#D4AF37]">
                      <Shield className="w-5 h-5" />
                      Estado NSS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoItem 
                        icon={<Calendar className="w-4 h-4" />}
                        label="Última Actualización"
                        value={result.nss.status.ultima_actualizacion}
                      />
                      <InfoItem 
                        icon={<Shield className="w-4 h-4" />}
                        label="Estado"
                        value={result.nss.status.mensaje}
                        highlight={result.nss.status.mensaje === "terminado"}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A2A2A] bg-[#0F0F0F]/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center gap-4">
          <img 
            src={LOGO_URL} 
            alt="CONER Logo" 
            className="h-10 w-auto opacity-60"
          />
          <p className="text-[#A3A3A3] text-sm text-center">
            © {new Date().getFullYear()} CONER - Consultores Especializados en Retiros. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoItem({ icon, label, value, highlight = false }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-[#A3A3A3]">
        {icon}
        <span className="text-xs font-bold tracking-[0.1em] uppercase">{label}</span>
      </div>
      <p className={`text-base font-medium ${highlight ? 'text-green-400' : 'text-[#F5F5F5]'}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}
