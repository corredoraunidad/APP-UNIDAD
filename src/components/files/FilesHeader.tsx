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
      <div>
        <div className="flex items-center mb-2">
          <h1 className={`text-2xl font-bold ${text}`}>
            {moduleTexts.title}
          </h1>
        </div>
        <p className={textSecondary}>
          {moduleTexts.description}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
        {canCreate && (
          <Button 
            variant="outlined" 
            color="primary" 
            size="lg"
            onClick={onCreateFolder}
            className="w-full sm:w-auto px-6 py-3"
          >
            <FolderPlus size={18} className="mr-2" />
            Nueva Carpeta
          </Button>
        )}
        {canUpload && (
          <Button 
            variant="contained" 
            color="primary" 
            size="lg"
            onClick={onUploadFile}
            className="w-full sm:w-auto px-6 py-3"
          >
            <Upload size={18} className="mr-2" />
            Subir Archivo
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilesHeader; 