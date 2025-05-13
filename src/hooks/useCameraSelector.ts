
import { useState, useEffect } from 'react';

export const useCameraSelector = (isSamsungDevice: boolean) => {
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | undefined>(undefined);

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

  // Function to switch cameras
  const switchCamera = () => {
    if (availableCameras.length > 1) {
      const currentIndex = selectedCamera 
        ? availableCameras.findIndex(camera => camera.deviceId === selectedCamera)
        : -1;
        
      const nextIndex = (currentIndex + 1) % availableCameras.length;
      setSelectedCamera(availableCameras[nextIndex].deviceId);
      
      console.log(`Switching camera to: ${availableCameras[nextIndex].label || 'Camera ' + (nextIndex + 1)}`);
    }
  };

  return {
    availableCameras,
    selectedCamera,
    switchCamera
  };
};
