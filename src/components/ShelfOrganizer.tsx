
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader, PackageCheck } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import ShelfForm from '@/components/ShelfForm';
import ScanningInterface from '@/components/ScanningInterface';
import SavedShelfOptions from '@/components/SavedShelfOptions';

export function ShelfOrganizer() {
  const {
    isOrganizing,
    currentEventId,
    currentShelfId,
    uiState,
    isLoading,
    startOrganizationEvent
  } = useOrganization();

  // If not organizing, show the start button
  if (!isOrganizing) {
    return (
      <div className="p-4 flex flex-col items-center">
        <Button 
          onClick={startOrganizationEvent} 
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <PackageCheck size={20} />
          Iniciar Organización de Estantes
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Event Status Header */}
      <div className="bg-muted p-3 rounded-md flex items-center justify-between">
        <div>
          <span className="font-semibold">Evento: </span>
          <span className="text-primary">{currentEventId}</span>
        </div>
        <div>
          <span className="font-semibold">Estante Actual: </span>
          <span className="text-primary">
            {currentShelfId || 'N/A'}
          </span>
        </div>
      </div>

      {/* Display different UI based on state */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader className="animate-spin h-6 w-6 text-primary" />
        </div>
      )}

      {uiState === 'awaiting_shelf_id' && <ShelfForm />}
      {(uiState === 'scanning_active' || uiState === 'reviewing_shelf') && <ScanningInterface />}
      {uiState === 'shelf_saved_options' && <SavedShelfOptions />}
    </div>
  );
}

export default ShelfOrganizer;
