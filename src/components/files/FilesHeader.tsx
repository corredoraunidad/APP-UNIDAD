import React from 'react';
import {  FolderPlus, Upload } from 'lucide-react';
import Button from '../ui/Button';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import { useModuleTexts } from '../../hooks/useModuleTexts';

interface FilesHeaderProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
  canCreate?: boolean;
  canUpload?: boolean;
}

const FilesHeader: React.FC<FilesHeaderProps> = ({
  onCreateFolder,
  onUploadFile,
  canCreate = true,
  canUpload = true
}) => {
  const { text, textSecondary } = useThemeClasses();
  const moduleTexts = useModuleTexts('archivos');
  
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-8 gap-4">
      <div className="hidden lg:block">
        <div className="flex items-center mb-2">
          <h1 className={`text-2xl font-bold ${text}`}>
            {moduleTexts.title}
          </h1>
        </div>
        <p className={textSecondary}>
          {moduleTexts.description}
        </p>
      </div>
      
      <div className="flex flex-row gap-2 sm:gap-3 flex-shrink-0">
        {canCreate && (
          <Button 
            variant="outlined" 
            color="primary" 
            size="sm"
            onClick={onCreateFolder}
            className="flex-1 sm:flex-none sm:w-auto sm:px-4 sm:py-2 sm:text-base lg:px-5 lg:py-2.5 lg:text-base"
          >
            <FolderPlus className="mr-2 w-4 h-4 lg:w-5 lg:h-5" />
            Nueva Carpeta
          </Button>
        )}
        {canUpload && (
          <Button 
            variant="contained" 
            color="primary" 
            size="sm"
            onClick={onUploadFile}
            className="flex-1 sm:flex-none sm:w-auto sm:px-4 sm:py-2 sm:text-base lg:px-5 lg:py-2.5 lg:text-base"
          >
            <Upload className="mr-2 w-4 h-4 lg:w-5 lg:h-5" />
            Subir Archivo
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilesHeader; 