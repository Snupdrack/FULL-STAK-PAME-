import { useState } from "react";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { motion } from "framer-motion";
import { Download, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_URL = "/logo.png";

// PDF Styles
const styles = StyleSheet.create({
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
  logo: {
    width: 100,
    height: 40,
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
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Historial Laboral IMSS</Text>
            <Text style={styles.subtitle}>Documento generado el {now}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "#D4AF37" }}>CONER</Text>
            <Text style={{ fontSize: 8, color: "#666666" }}>Consultores Especializados</Text>
            <Text style={{ fontSize: 8, color: "#666666" }}>en Retiros</Text>
          </View>
        </View>

        {/* Personal Information */}
        {data.nss?.info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nombre Completo</Text>
                <Text style={styles.infoValue}>
                  {`${data.nss.info.nombres || ""} ${data.nss.info.apellido_paterno || ""} ${data.nss.info.apellido_materno || ""}`}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CURP</Text>
                <Text style={styles.infoValue}>{data.nss.info.curp || curp}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Número de Seguridad Social</Text>
                <Text style={styles.infoValue}>{data.nss.info.numero_seguridad_social || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Fecha de Nacimiento</Text>
                <Text style={styles.infoValue}>{data.nss.info.fecha_nacimiento || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Lugar de Nacimiento</Text>
                <Text style={styles.infoValue}>{data.nss.info.lugar_nacimiento || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sexo</Text>
                <Text style={styles.infoValue}>{data.nss.info.sexo || "N/A"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* NSS Status */}
        {data.nss?.status && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado NSS</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Última Actualización</Text>
                <Text style={styles.infoValue}>{data.nss.status.ultima_actualizacion || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Estado</Text>
                <View style={styles.statusBadge}>
                  <Text style={{ color: "#FFFFFF", fontSize: 9 }}>{data.nss.status.mensaje || "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Historial Status */}
        {data.historial?.status && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado del Historial</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Última Actualización</Text>
                <Text style={styles.infoValue}>{data.historial.status.ultima_actualizacion || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Estado</Text>
                <View style={styles.statusBadge}>
                  <Text style={{ color: "#FFFFFF", fontSize: 9 }}>{data.historial.status.mensaje || "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Historial Info */}
        {data.historial?.info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Historial</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>NSS del Historial</Text>
                <Text style={styles.infoValue}>{data.historial.info.numero_seguridad_social || "N/A"}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CURP del Historial</Text>
                <Text style={styles.infoValue}>{data.historial.info.curp || "N/A"}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento es de carácter informativo. La información presentada corresponde
            a los datos registrados en el sistema del IMSS.
          </Text>
          <Text style={styles.watermark}>CONER - Consultores Especializados en Retiros</Text>
        </View>
      </Page>
    </Document>
  );
};

// Modal Component
export default function PDFExport({ data, curp, onClose }) {
  const fileName = `historial_laboral_${curp}_${new Date().toISOString().split("T")[0]}.pdf`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        data-testid="pdf-export-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A3A3A3] hover:text-white transition-colors"
          data-testid="close-pdf-modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <h3 className="font-heading text-2xl text-[#F5F5F5] mb-2">
            Exportar a PDF
          </h3>
          <p className="text-[#A3A3A3] text-sm mb-8">
            Descarga el historial laboral en formato PDF
          </p>

          {/* Download Button */}
          <PDFDownloadLink
            document={<HistorialPDF data={data} curp={curp} />}
            fileName={fileName}
          >
            {({ blob, url, loading, error }) => (
              <Button
                data-testid="download-pdf-button"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-black hover:bg-[#B5952F] font-bold px-8 py-6 h-14 rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 btn-lift"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Descargar PDF
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>

          {/* Cancel Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full mt-4 text-[#A3A3A3] hover:text-white hover:bg-white/5"
            data-testid="cancel-pdf-button"
          >
            Cancelar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
