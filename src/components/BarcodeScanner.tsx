
import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, Result, BarcodeFormat } from '@zxing/library';
import { Barcode } from 'lucide-react';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isScanning: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onBarcodeDetected, 
  isScanning 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the barcode reader when component mounts
    const codeReader = new BrowserMultiFormatReader();
    
    // Set preferred formats to optimize detection
    codeReader.hints.set(
      2, // DecodeHintType.POSSIBLE_FORMATS
      [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ]
    );

    const startCamera = async () => {
      try {
        // Check if the camera is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by this browser');
        }

        // Request camera permission
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasPermission(true);
        
        if (videoRef.current) {
          // Start decoding from the video device
          await codeReader.decodeFromVideoDevice(
            undefined, // Use default camera
            videoRef.current,
            (result: Result | null, error: Error | undefined) => {
              if (result && isScanning) {
                console.log('Barcode detected:', result.getText());
                onBarcodeDetected(result.getText());
              }
              
              if (error && error.name !== 'NotFoundException') {
                console.error('Barcode detection error:', error);
              }
            }
          );
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setErrorMessage('Camera access denied. Please allow camera access to scan barcodes.');
          } else if (error.name === 'NotFoundError') {
            setErrorMessage('No camera found. Please make sure your device has a camera.');
          } else {
            setErrorMessage(`Camera error: ${error.message}`);
          }
        } else {
          setErrorMessage('An unknown error occurred while accessing the camera.');
        }
      }
    };

    if (isScanning) {
      startCamera();
    }

    // Clean up when component unmounts
    return () => {
      codeReader.reset();
    };
  }, [onBarcodeDetected, isScanning]);

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <Barcode className="h-12 w-12 mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
        <p className="text-center">{errorMessage || 'Please allow camera access to use the barcode scanner.'}</p>
      </div>
    );
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
        
        {/* Scanning overlay */}
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
                {isScanning ? 'Scanning for barcode...' : 'Scanner paused'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
