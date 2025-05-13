
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';

interface CameraControlsProps {
  onSwitchCamera: () => void;
  showControls: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({ 
  onSwitchCamera, 
  showControls 
}) => {
  if (!showControls) return null;
  
  return (
    <div className="mt-2 flex justify-center">
      <Button 
        onClick={onSwitchCamera} 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
      >
        <Camera size={16} />
        <RefreshCw size={14} />
        Cambiar cámara
      </Button>
    </div>
  );
};

export default CameraControls;
