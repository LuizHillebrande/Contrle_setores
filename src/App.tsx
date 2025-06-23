import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingLayout from './components/LandingLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// App Pages
import Comercial from './pages/sector/Comercial';
import Compras from './pages/sector/Compras';
import Montagem from './pages/sector/Montagem';
import Producao from './pages/sector/Producao';
import Expedicao from './pages/sector/Expedicao';
import Faturamento from './pages/sector/Faturamento';
import Admin from './pages/Admin';
import NewOrder from './pages/NewOrder';
import ManageEmployees from './pages/admin/ManageEmployees';
import CollaboratorProfile from './pages/CollaboratorProfile';
import HumanResources from './pages/HumanResources';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas com Layout da Landing Page */}
          <Route path="/" element={<LandingLayout><LandingPage /></LandingLayout>} />
          <Route path="/login" element={<LandingLayout><Login /></LandingLayout>} />
          <Route path="/signup" element={<LandingLayout><SignUp /></LandingLayout>} />

          {/* Rotas Protegidas da Aplicação Principal */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil-colaboradores" element={<CollaboratorProfile />} />
            <Route path="/pedidos/novo" element={<NewOrder />} />
            <Route path="/comercial" element={<Comercial />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/montagem" element={<Montagem />} />
            <Route path="/producao" element={<Producao />} />
            <Route path="/expedicao" element={<Expedicao />} />
            <Route path="/faturamento" element={<Faturamento />} />
            <Route path="/app" element={<Navigate to="/comercial" replace />} />
          </Route>

          {/* Rotas Protegidas de Administração */}
          <Route element={<ProtectedRoute allowedRoles={['administrador', 'Gerente de RH']} />}>
            <Route path="/recursos-humanos" element={<HumanResources />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/funcionarios" element={<ManageEmployees />} />
          </Route>
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 