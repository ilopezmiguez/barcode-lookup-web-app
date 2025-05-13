
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, LogOut, CheckCircle } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export default function SavedShelfOptions() {
  const { currentShelfId, startNewShelf, endOrganizationEvent } = useOrganization();

  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center justify-center flex-col gap-4 p-6 bg-primary/10 rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h3 className="text-xl font-medium text-center">
          Estante {currentShelfId} guardado correctamente
        </h3>
        <p className="text-muted-foreground text-center">
          Los productos escaneados han sido registrados en la base de datos.
          ¿Qué desea hacer a continuación?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={startNewShelf}
        >
          <FolderPlus size={18} />
          Continuar con nuevo estante
        </Button>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={endOrganizationEvent}
        >
          <LogOut size={18} />
          Finalizar evento
        </Button>
      </div>
    </div>
  );
}
