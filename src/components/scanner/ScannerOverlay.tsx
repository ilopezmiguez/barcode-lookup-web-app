
import React from 'react';

interface ScannerOverlayProps {
  isScanning: boolean;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isScanning }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Scanning guides */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="border-2 border-blue-500 rounded-lg w-5/6 h-1/3 flex items-center justify-center">
          {isScanning && (
            <div className="h-px w-full bg-blue-500 animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <div className="flex items-center justify-center">
          <div className={`h-3 w-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'} mr-2`}></div>
          <p className="text-white text-sm font-medium">
            {isScanning ? 'Escaneando código de barras...' : 'Escáner en pausa'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerOverlay;
