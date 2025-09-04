import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useThemeClasses } from '../../../hooks/useThemeClasses';
import logoUnidad from '../../../assets/LogoUnidad.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { bg, bgCard, text, textSecondary, textMuted, inputBg, inputText, inputPlaceholder, inputBorder } = useThemeClasses();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar error anterior
    setLocalError(null);
    
    // Validaciones básicas
    if (!email.trim()) {
      setLocalError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    if (!password.trim()) {
      setLocalError('Por favor ingresa tu contraseña');
      return;
    }

    try {
      const result = await login(email.trim(), password.trim());
      if (result.success) {
        navigate('/dashboard');
      } else {
        setLocalError(result.error || 'Error de autenticación');
      }
    } catch (error) {
      setLocalError('Error de conexión. Intenta nuevamente.');
    }
  };

  const handleForgotPassword = () => {
    alert('Por favor contacta al administrador para recuperar tu contraseña.');
  };

  return (
    <div className={`min-h-screen w-full ${bg} flex items-center justify-center`}>
      <div className="w-full max-w-md px-4">
        <div className={`${bgCard} rounded-2xl shadow-lg p-8 md:p-10`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-full h-24 mb-6 flex items-center justify-center">
              <img 
                src={logoUnidad} 
                alt="Logo Unidad Seguros" 
                className="h-full w-auto object-contain"
              />
            </div>
            <h1 className={`text-2xl font-semibold ${text} mb-2`}>
              Iniciar Sesión
            </h1>
          </div>

          {/* Mostrar error si existe */}
          {localError && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{localError}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${textSecondary} mb-2 text-left`}>
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] hover:border-gray-400`}
                  placeholder="tu@email.com"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${textSecondary} mb-2 text-left`}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 ${inputBg} ${inputText} ${inputPlaceholder} border ${inputBorder} rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fd8412] focus:border-[#fd8412] hover:border-gray-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textMuted} hover:text-[#fd8412] transition-colors duration-200 p-1 rounded`}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#fd8412] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#e6760f] focus:ring-2 focus:ring-[#fd8412] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando Sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Olvidé mi contraseña */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-[#fd8412] hover:text-[#e6760f] text-sm font-medium transition-colors duration-200 disabled:opacity-50 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
