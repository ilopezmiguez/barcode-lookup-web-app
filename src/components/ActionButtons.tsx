
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  copyBarcodesToClipboard: () => void;
  clearMissingProducts: () => void;
  isLoading: boolean;
  isClearing: boolean;
  isCopied: boolean;
  hasProducts: boolean;
}

export function ActionButtons({
  copyBarcodesToClipboard,
  clearMissingProducts,
  isLoading,
  isClearing,
  isCopied,
  hasProducts
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        onClick={copyBarcodesToClipboard} 
        className="flex items-center gap-2"
        disabled={isLoading || !hasProducts}
      >
        <Copy size={16} />
        {isCopied ? "¡Copiado!" : "Copiar datos en CSV"}
      </Button>
      
      <Button 
        onClick={clearMissingProducts} 
        variant="destructive" 
        className="flex items-center gap-2"
        disabled={isLoading || isClearing || !hasProducts}
      >
        <Trash2 size={16} />
        {isClearing ? "Vaciando..." : "Vaciar Lista de Faltantes"}
      </Button>
    </div>
  );
}
