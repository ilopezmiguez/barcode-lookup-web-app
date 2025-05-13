
import { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader, Result, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface UseBarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isScanning: boolean;
  selectedCamera?: string;
}

export const useBarcodeScanner = ({ 
  onBarcodeDetected, 
  isScanning, 
  selectedCamera 
}: UseBarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSamsungDevice, setIsSamsungDevice] = useState<boolean>(false);
  const lastScannedRef = useRef<string | null>(null);
  const scanTimeoutRef = useRef<number | null>(null);

  // Detect if the device is a Samsung device
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSamsung = userAgent.includes('samsung') || userAgent.includes('sm-');
    setIsSamsungDevice(isSamsung);
    console.log("Device detection:", { userAgent, isSamsung });
  }, []);

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
      
      // Clear any pending timeouts
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
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
        
        // If we have a selected camera, use it
        if (selectedCamera) {
          (constraints.video as MediaTrackConstraints).deviceId = { exact: selectedCamera };
        }

        // Ensure we have camera permission
        await navigator.mediaDevices.getUserMedia(constraints);
        setHasPermission(true);
        
        // For Samsung devices, add a small delay before starting the decoder
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
              
              // Prevent duplicate scans by checking if this is a new barcode
              // or if enough time has passed since the last scan
              if (lastScannedRef.current !== barcodeText) {
                lastScannedRef.current = barcodeText;
                onBarcodeDetected(barcodeText);
                
                // Reset the last scanned code after a delay to allow rescanning the same code later
                if (scanTimeoutRef.current) {
                  clearTimeout(scanTimeoutRef.current);
                }
                
                scanTimeoutRef.current = window.setTimeout(() => {
                  lastScannedRef.current = null;
                }, 3000); // 3 second cooldown before the same code can be scanned again
              }
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

  return {
    videoRef,
    hasPermission,
    errorMessage
  };
};
