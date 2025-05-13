
import React, { useState } from 'react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useCameraSelector } from '@/hooks/useCameraSelector';
import ScannerOverlay from '@/components/scanner/ScannerOverlay';
import CameraControls from '@/components/scanner/CameraControls';
import ErrorMessage from '@/components/scanner/ErrorMessage';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isScanning: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  isScanning
}) => {
  // Detect Samsung devices for special handling
  const [isSamsungDevice, setIsSamsungDevice] = useState<boolean>(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('samsung') || userAgent.includes('sm-');
  });

  // Get camera selection capabilities
  const { 
    availableCameras,
    selectedCamera,
    switchCamera
  } = useCameraSelector(isSamsungDevice);

  // Setup barcode scanner
  const { 
    videoRef, 
    hasPermission, 
    errorMessage 
  } = useBarcodeScanner({
    onBarcodeDetected,
    isScanning,
    selectedCamera
  });

  // Error handling
  if (hasPermission === false) {
    return <ErrorMessage message={errorMessage} />;
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Scanner UI */}
      <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3] w-full">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
          autoPlay 
          playsInline 
          muted
        />
        
        {/* Scanning overlay with guides and status */}
        <ScannerOverlay isScanning={isScanning} />
      </div>
      
      {/* Camera controls for Samsung devices */}
      <CameraControls 
        onSwitchCamera={switchCamera}
        showControls={isSamsungDevice && availableCameras.length > 1}
      />
    </div>
  );
};

export default BarcodeScanner;
