import React from 'react';
import { Grid3X3, List } from 'lucide-react';
import { useThemeClasses } from '../../hooks/useThemeClasses';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewChange, 
  className = '' 
}) => {
  const { bgSurface, textSecondary, hoverText } = useThemeClasses();
  
  return (
    <div className={`flex items-center ${bgSurface} rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-white text-[#fd8412] shadow-sm'
            : `${textSecondary} ${hoverText} hover:bg-gray-200`
        }`}
        title="Vista de cuadrícula"
      >
        <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-md transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-white text-[#fd8412] shadow-sm'
            : `${textSecondary} ${hoverText} hover:bg-gray-200`
        }`}
        title="Vista de lista"
      >
        <List className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
};

export default ViewToggle;
