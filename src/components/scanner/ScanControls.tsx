
import React from 'react';
import { Button } from '@/components/ui/button';

interface ScanControlsProps {
  isScanning: boolean;
  onToggleScan: () => void;
  showControls: boolean;
}

const ScanControls: React.FC<ScanControlsProps> = ({
  isScanning,
  onToggleScan,
  showControls
}) => {
  if (!showControls) return null;
  
  return (
    <div className="flex justify-center gap-2 mb-2">
      <Button 
        variant="outline" 
        onClick={onToggleScan}
      >
        {isScanning ? 'Pausar Escáner' : 'Reanudar Escáner'}
      </Button>
    </div>
  );
};

export default ScanControls;
