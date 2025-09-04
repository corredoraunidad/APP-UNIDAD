import React, { useEffect, useRef } from 'react';
import { useThemeClasses } from '../../hooks/useThemeClasses';
import '../../styles/quill-custom.css';

// Declarar Quill como global
declare global {
  interface Window {
    Quill: any;
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escribe el contenido del anuncio...',
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const { inputBg, inputText, inputBorder } = useThemeClasses();

  useEffect(() => {
    if (editorRef.current && window.Quill && !quillRef.current) {
      // Crear el editor Quill
      quillRef.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link'],
            ['clean']
          ]
        }
      });

      // Escuchar cambios en el contenido
      quillRef.current.on('text-change', () => {
        const html = editorRef.current?.querySelector('.ql-editor')?.innerHTML || '';
        onChange(html);
      });

      // Establecer contenido inicial si existe
      if (value) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, []);

  // Actualizar contenido cuando cambie el prop value
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className={className}>
      <div 
        ref={editorRef}
        className={`${inputBg} ${inputText} border ${inputBorder} rounded-lg focus-within:ring-2 focus-within:ring-[#fd8412] focus-within:border-transparent min-h-[200px]`}
      />
    </div>
  );
};

export default RichTextEditor;
