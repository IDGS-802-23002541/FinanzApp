import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticado } from '../stores/auth';

export interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const autenticado = useAutenticado();
  const location = useLocation();

  if (!autenticado) {
    const destino = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?destino=${destino}`} replace />;
  }

  return <>{children}</>;
}
