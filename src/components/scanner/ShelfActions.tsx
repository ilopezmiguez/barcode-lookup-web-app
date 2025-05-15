
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface ShelfActionsProps {
  onCancel: () => void;
  onSave: () => void;
  productCount: number;
  isLoading: boolean;
}

const ShelfActions: React.FC<ShelfActionsProps> = ({
  onCancel,
  onSave,
  productCount,
  isLoading
}) => {
  return (
    <div className="flex gap-3 pb-4">
      <Button 
        variant="destructive" 
        onClick={onCancel} 
        className="flex-1"
        disabled={isLoading}
      >
        <X size={18} className="mr-1" />
        Borrar Estante
      </Button>
      
      <Button 
        onClick={onSave} 
        className="flex-1"
        disabled={productCount === 0 || isLoading}
      >
        <Save size={18} className="mr-1" />
        {isLoading ? 'Guardando...' : 'Guardar Estante'}
      </Button>
    </div>
  );
};

export default ShelfActions;
