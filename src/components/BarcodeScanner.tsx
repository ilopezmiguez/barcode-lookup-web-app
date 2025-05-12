
import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, Result, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Barcode, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isScanning: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onBarcodeDetected, 
  isScanning 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>(undefined);
  const [isSamsungDevice, setIsSamsungDevice] = useState<boolean>(false);

  // Detect if the device is a Samsung device
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSamsung = userAgent.includes('samsung') || userAgent.includes('sm-');
    setIsSamsungDevice(isSamsung);
    console.log("Device detection:", { userAgent, isSamsung });
  }, []);

  // Get available cameras
  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log('enumerateDevices not supported');
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', cameras);
        setAvailableCameras(cameras);
        
        // For Samsung devices, try to select the back camera if available
        if (isSamsungDevice && cameras.length > 1) {
          // Often the back camera has "back" in the label or is the second camera
          const backCamera = cameras.find(camera => 
            camera.label.toLowerCase().includes('back') || 
            camera.label.toLowerCase().includes('trasera') ||
            camera.label.toLowerCase().includes('0')
          );
          
          if (backCamera) {
            setSelectedCamera(backCamera.deviceId);
            console.log('Selected back camera for Samsung device:', backCamera);
          }
        }
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    getAvailableCameras();
  }, [isSamsungDevice]);

  // Initialize barcode reader
  useEffect(() => {
    // Configure ZXing with optimized settings
    const hints = new Map();
    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
      ]
    );
    
    // Set additional ZXing configuration for Samsung devices
    if (isSamsungDevice) {
      hints.set(DecodeHintType.TRY_HARDER, true);
      hints.set(DecodeHintType.ASSUME_GS1, false);
    }
    
    const codeReader = new BrowserMultiFormatReader(hints);
    readerRef.current = codeReader;
    
    return () => {
      // Clean up when component unmounts
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
    };
  }, [isSamsungDevice]);

  // Start/stop camera based on isScanning prop
  useEffect(() => {
    const startCamera = async () => {
      if (!readerRef.current || !videoRef.current) {
        console.error('Reader or video element not ready');
        return;
      }

      try {
        setErrorMessage(null);
        
        // Check if browser supports camera access
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('La cámara no es compatible con este navegador');
        }

        // Configure camera constraints
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        // If we have a selected camera (especially for Samsung devices), use it
        if (selectedCamera) {
          (constraints.video as MediaTrackConstraints).deviceId = { exact: selectedCamera };
        }

        // Ensure we have camera permission
        await navigator.mediaDevices.getUserMedia(constraints);
        setHasPermission(true);
        
        // For Samsung devices, we add a small delay before starting the decoder
        // This helps with issues where the camera starts but scanning doesn't work
        if (isSamsungDevice) {
          console.log("Samsung device detected, adding initialization delay");
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log("Starting barcode decoder with camera:", selectedCamera || "default");
        await readerRef.current.decodeFromVideoDevice(
          selectedCamera, // Use selected camera or default if undefined
          videoRef.current,
          (result: Result | null, error: Error | undefined) => {
            if (result && isScanning) {
              const barcodeText = result.getText();
              console.log('Barcode detected:', barcodeText);
              onBarcodeDetected(barcodeText);
            }
            
            if (error && error.name !== 'NotFoundException') {
              console.error('Barcode detection error:', error);
            }
          }
        );
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasPermission(false);
        
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            setErrorMessage('Acceso a la cámara denegado. Por favor permita el acceso a la cámara para escanear códigos de barras.');
          } else if (error.name === 'NotFoundError') {
            setErrorMessage('No se encontró ninguna cámara. Por favor asegúrese de que su dispositivo tiene una cámara.');
          } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
            setErrorMessage('La cámara está en uso por otra aplicación o no es accesible.');
          } else {
            setErrorMessage(`Error de cámara: ${error.message}`);
          }
        } else {
          setErrorMessage('Ocurrió un error desconocido al acceder a la cámara.');
        }
      }
    };

    const stopCamera = () => {
      if (readerRef.current) {
        readerRef.current.reset();
        console.log("Camera reset");
      }
    };

    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [onBarcodeDetected, isScanning, selectedCamera, isSamsungDevice]);

  // Function to switch cameras
  const switchCamera = async () => {
    if (readerRef.current) {
      readerRef.current.reset();
      
      // Cycle through available cameras
      if (availableCameras.length > 1) {
        const currentIndex = selectedCamera 
          ? availableCameras.findIndex(camera => camera.deviceId === selectedCamera)
          : -1;
          
        const nextIndex = (currentIndex + 1) % availableCameras.length;
        setSelectedCamera(availableCameras[nextIndex].deviceId);
        
        console.log(`Switching camera to: ${availableCameras[nextIndex].label || 'Camera ' + (nextIndex + 1)}`);
      }
    }
  };

  // Error message display
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
        <Barcode className="h-12 w-12 mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2">Se requiere acceso a la cámara</h3>
        <p className="text-center">{errorMessage || 'Por favor permita el acceso a la cámara para utilizar el escáner de códigos de barras.'}</p>
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
                {isScanning ? 'Escaneando código de barras...' : 'Escáner en pausa'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Camera controls for Samsung devices */}
      {isSamsungDevice && availableCameras.length > 1 && (
        <div className="mt-2 flex justify-center">
          <Button 
            onClick={switchCamera} 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Camera size={16} />
            <RefreshCw size={14} />
            Cambiar cámara
          </Button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
