
import React from 'react';
import { Button } from '@/components/ui/button';
import { useShelfOrganizer } from '@/hooks/useShelfOrganizer';
import { Clipboard, X } from 'lucide-react';

export default function SavedShelfOptions() {
  const { startNewShelf, endOrganizationEvent } = useShelfOrganizer();

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-1">Estante guardado con éxito</h3>
        <p>¿Qué deseas hacer ahora?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button 
          onClick={startNewShelf} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Clipboard size={18} />
          Nuevo Estante
        </Button>
        
        <Button 
          onClick={endOrganizationEvent} 
          variant="secondary" 
          className="flex items-center gap-2"
        >
          <X size={18} />
          Terminar
        </Button>
      </div>
    </div>
  );
}
