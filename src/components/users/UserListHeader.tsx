import React, { useState } from 'react';
import { Search, Filter, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { usePermissions } from '../../hooks/usePermissions';
import type { UserFilters } from '../../types';

// Lista de regiones de Chile (igual que en UserCreationModal)
const REGIONES_CHILE = [
  { id: 1, nombre: 'Arica y Parinacota' },
  { id: 2, nombre: 'Tarapacá' },
  { id: 3, nombre: 'Antofagasta' },
  { id: 4, nombre: 'Atacama' },
  { id: 5, nombre: 'Coquimbo' },
  { id: 6, nombre: 'Valparaíso' },
  { id: 7, nombre: 'Región Metropolitana de Santiago' },
  { id: 8, nombre: 'Libertador General Bernardo O\'Higgins' },
  { id: 9, nombre: 'Maule' },
  { id: 10, nombre: 'Ñuble' },
  { id: 11, nombre: 'Biobío' },
  { id: 12, nombre: 'La Araucanía' },
  { id: 13, nombre: 'Los Ríos' },
  { id: 14, nombre: 'Los Lagos' },
  { id: 15, nombre: 'Aysén del General Carlos Ibáñez del Campo' },
  { id: 16, nombre: 'Magallanes y de la Antártica Chilena' }
];

interface UserListHeaderProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onCreateNew: () => void;
}

const UserListHeader: React.FC<UserListHeaderProps> = ({
  filters,
  onFiltersChange,
  onCreateNew
}) => {
  const { can } = usePermissions();
  const { bgCard, textSecondary, textMuted, inputBg, inputBorder, inputText, inputPlaceholder } = useThemeClasses();
  const [showFilters, setShowFilters] = useState(false);

  // Manejar búsqueda
  const handleSearch = (searchTerm: string) => {
    onFiltersChange({
      ...filters,
      search: searchTerm || undefined,
      page: 1 // Resetear a primera página
    });
  };

  // Manejar filtros
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Resetear a primera página
    });
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 5
    });
  };

  return (
    <div className={`${bgCard} rounded-lg shadow-sm p-4`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className={`w-full pl-10 pr-4 py-2 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
            onChange={(e) => handleSearch(e.target.value)}
            value={filters.search || ''}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filtros
          </Button>
          
          {can('usuarios', 'create') && (
            <Button
              onClick={onCreateNew}
              className="flex items-center gap-2"
            >
              <UserPlus size={16} />
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="mt-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Rol */}
            <div className="flex-1">
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                Rol
              </label>
              <select
                className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                onChange={(e) => handleFilterChange('rol', e.target.value || undefined)}
                value={filters.rol || ''}
              >
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="admin_comercial">Admin Comercial</option>
                <option value="admin_operaciones">Admin Operaciones</option>
                <option value="broker">Corredor</option>
                <option value="broker_externo">Corredor Externo</option>
              </select>
            </div>

            {/* Región */}
            <div className="flex-1">
              <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                Región
              </label>
              <select
                className={`w-full px-3 py-2 ${inputBg} ${inputText} border ${inputBorder} rounded-lg focus:ring-2 focus:ring-[#fd8412] focus:border-transparent`}
                onChange={(e) => handleFilterChange('region', e.target.value ? parseInt(e.target.value) : undefined)}
                value={filters.region?.toString() || ''}
              >
                <option value="">Todas las regiones</option>
                {REGIONES_CHILE.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.id === 7 ? 'RM' : region.id} - {region.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            <div>
              <Button
                onClick={handleClearFilters}
                variant="outlined"
                className="text-sm"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListHeader;
