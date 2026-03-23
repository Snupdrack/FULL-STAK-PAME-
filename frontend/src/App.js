import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/pages/HomePage";
import AdminLogin from "@/pages/AdminLogin";
import AdminPanel from "@/pages/AdminPanel";
import Login from "@/pages/Login";
import AuthGuard from "@/components/AuthGuard";

function App() {
  return (
    <ErrorBoundary>
      <div className="App min-h-screen bg-[#050505]">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: '#F5F5F5',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
