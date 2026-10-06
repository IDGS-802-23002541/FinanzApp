import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { ToastHost } from './components/ToastHost';
import { Shell } from './layout/Shell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Registro from './pages/Registro';
import NoEncontrado from './pages/NoEncontrado';
import Lista from './pages/carteras/Lista';
import Detalle from './pages/carteras/Detalle';
import Contribuyentes from './pages/Contribuyentes';
import Transacciones from './pages/Transacciones';
import Inactivas from './pages/Inactivas';
import Ajustes from './pages/Ajustes';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/app/carteras" replace />} />
          <Route path="inicio" element={<Navigate to="/app/carteras" replace />} />
          <Route path="colaboraciones" element={<Navigate to="/app/carteras" replace />} />
          <Route path="carteras" element={<Lista />} />
          <Route path="carteras/:id" element={<Detalle />} />
          <Route path="contribuyentes" element={<Contribuyentes />} />
          <Route path="transacciones" element={<Transacciones />} />
          <Route path="inactivas" element={<Inactivas />} />
          <Route path="ajustes" element={<Ajustes />} />
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
      <ToastHost />
    </>
  );
}
