// Tipos para el sistema de archivos
export interface FileItem {
  id: string;
  name: string;
  type: 'file';
  size: number;
  path: string;
  mime_type?: string;
  created_at: string;
  updated_at: string;
  storage_path?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  path: string;
  created_at: string;
  updated_at: string;
  itemCount?: number; // Para mostrar cantidad de elementos
}

export interface FileData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  extension?: string;
  modified: Date;
  itemCount?: number;
  path: string;
  mime_type?: string;
}

// Tipos para operaciones
export interface FolderContents {
  folders: FolderItem[];
  files: FileItem[];
}

export interface UploadFileData {
  fileName: string;
  file: File;
  mimeType: string;
  fileSize: number;
  parentPath: string;
}

export interface CreateFolderData {
  folderName: string;
  parentPath: string;
}

// Tipos para respuestas de servicios
export interface FileServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface FolderContentCount {
  filesCount: number;
  foldersCount: number;
  totalCount: number;
} 