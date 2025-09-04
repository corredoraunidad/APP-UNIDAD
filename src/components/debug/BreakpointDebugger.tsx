import React from 'react';
import { useBreakpoints } from '../../hooks/useBreakpoints';
import { useNavigation } from '../../hooks/useNavigation';

// Componente de debug para probar los hooks de breakpoints y navegación
const BreakpointDebugger: React.FC = () => {
  const breakpoints = useBreakpoints();
  const navigation = useNavigation();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="space-y-2">
        <div className="font-bold text-green-400">Breakpoints Debug</div>
        
        <div>
          <span className="text-gray-400">Current: </span>
          <span className="text-yellow-400">{breakpoints.currentBreakpoint}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Width: </span>
          <span className="text-blue-400">{breakpoints.windowWidth}px</span>
        </div>
        
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className={breakpoints.isMobile ? 'text-green-400' : 'text-gray-500'}>
            Mobile: {breakpoints.isMobile ? '✓' : '✗'}
          </div>
          <div className={breakpoints.isTablet ? 'text-green-400' : 'text-gray-500'}>
            Tablet: {breakpoints.isTablet ? '✓' : '✗'}
          </div>
          <div className={breakpoints.isDesktop ? 'text-green-400' : 'text-gray-500'}>
            Desktop: {breakpoints.isDesktop ? '✓' : '✗'}
          </div>
          <div className={breakpoints.isLargeScreen ? 'text-green-400' : 'text-gray-500'}>
            Large: {breakpoints.isLargeScreen ? '✓' : '✗'}
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-2">
          <div className="font-bold text-green-400">Navigation Debug</div>
          <div>
            <span className="text-gray-400">Sidebar: </span>
            <span className={navigation.sidebarOpen ? 'text-green-400' : 'text-red-400'}>
              {navigation.sidebarOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Overlay: </span>
            <span className={navigation.isOverlayMode ? 'text-yellow-400' : 'text-gray-400'}>
              {navigation.isOverlayMode ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Menu Button: </span>
            <span className={navigation.shouldShowMenuButton ? 'text-green-400' : 'text-gray-400'}>
              {navigation.shouldShowMenuButton ? 'Show' : 'Hide'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakpointDebugger;
