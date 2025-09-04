import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChangePasswordModalProvider } from './contexts/ModalContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GlobalModals from './components/GlobalModals';
import Login from './pages/auth/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Usuarios from './pages/usuarios/Usuarios';
import Archivos from './pages/archivos/Archivos';
import Anuncios from './pages/anuncios/Anuncios';
import AsistenciasSiniestros from './pages/asistencias-siniestros/AsistenciasSiniestros';
import MetodosPago from './pages/metodos-pago/MetodosPago';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ChangePasswordModalProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* Login como página principal */}
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Otras rutas */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Módulos */}
                  <Route path="/usuarios" element={
                    <ProtectedRoute module="usuarios">
                      <Usuarios />
                    </ProtectedRoute>
                  } />
                  <Route path="/archivos" element={
                    <ProtectedRoute module="archivos">
                      <Archivos />
                    </ProtectedRoute>
                  } />
                  <Route path="/anuncios" element={
                    <ProtectedRoute module="anuncios">
                      <Anuncios />
                    </ProtectedRoute>
                  } />
                  
                  {/* Módulo Asistencias y Siniestros */}
                  <Route path="/asistencias-siniestros" element={
                    <ProtectedRoute module="asistencias_siniestros">
                      <AsistenciasSiniestros />
                    </ProtectedRoute>
                  } />
                  
                  {/* Módulo Métodos de Pago */}
                  <Route path="/metodos-pago" element={
                    <ProtectedRoute module="metodos_pago">
                      <MetodosPago />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </Router>
            
            {/* Modales globales */}
            <GlobalModals />
          </ChangePasswordModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
