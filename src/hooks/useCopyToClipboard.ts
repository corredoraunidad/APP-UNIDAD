import { useState, useCallback } from 'react';

interface CopyToClipboardState {
  isCopying: boolean;
  copiedText: string | null;
  error: string | null;
}

interface CopyToClipboardResult extends CopyToClipboardState {
  copyToClipboard: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook para copiar texto al portapapeles con feedback visual
 * 
 * @param timeout - Tiempo en ms para limpiar el estado de copiado (default: 2000)
 * @returns Objeto con estado y funciones para copiar
 */
export const useCopyToClipboard = (timeout: number = 2000): CopyToClipboardResult => {
  const [state, setState] = useState<CopyToClipboardState>({
    isCopying: false,
    copiedText: null,
    error: null,
  });

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    setState({
      isCopying: true,
      copiedText: null,
      error: null,
    });

    try {
      // Verificar si la API del portapapeles está disponible
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para navegadores más antiguos o contextos no seguros
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (!successful) {
          throw new Error('Fallback copy method failed');
        }
      }

      setState({
        isCopying: false,
        copiedText: text,
        error: null,
      });

      // Limpiar el estado después del timeout
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          copiedText: null,
        }));
      }, timeout);

      return true;
    } catch (error: any) {
      setState({
        isCopying: false,
        copiedText: null,
        error: error.message || 'Error al copiar al portapapeles',
      });

      // Limpiar el error después del timeout
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          error: null,
        }));
      }, timeout);

      return false;
    }
  }, [timeout]);

  const reset = useCallback(() => {
    setState({
      isCopying: false,
      copiedText: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    copyToClipboard,
    reset,
  };
};

/**
 * Hook simplificado que retorna solo la función de copiar y un estado booleano
 */
export const useSimpleCopy = (timeout: number = 2000) => {
  const { copyToClipboard, copiedText, isCopying, error } = useCopyToClipboard(timeout);
  
  return {
    copy: copyToClipboard,
    isCopied: !!copiedText && !error,
    isLoading: isCopying,
    error,
  };
};
