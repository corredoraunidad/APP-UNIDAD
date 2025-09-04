import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import type { Module } from '../../config/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: Module;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  module,
  fallbackPath = '/dashboard'
}) => {
  const { canAccess } = usePermissions();

  if (!canAccess(module)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 