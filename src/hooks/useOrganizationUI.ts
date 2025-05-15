
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ScannedProduct, OrganizerUIState } from '@/types/organization';

/**
 * Hook for UI-specific state management in the organization feature
 */
export function useOrganizationUI(
  scannedProducts: ScannedProduct[],
  changeUiState: (newState: OrganizerUIState) => void,
  resetOrganizationEvent: () => void,
  setCurrentShelfId: (shelfId: string) => void
) {
  // Start a new shelf after saving the previous one
  const startNewShelf = useCallback(() => {
    setCurrentShelfId('');
    changeUiState('awaiting_shelf_id');
    
    toast({
      title: "Nuevo estante",
      description: "Ingrese el código del nuevo estante"
    });
  }, [changeUiState, setCurrentShelfId]);

  // Cancel the current shelf without saving
  const cancelCurrentShelf = useCallback(() => {
    if (scannedProducts.length > 0) {
      if (!window.confirm('¿Está seguro que desea cancelar el estante actual? Se perderán todos los productos escaneados.')) {
        return;
      }
    }
    
    setCurrentShelfId('');
    changeUiState('awaiting_shelf_id');
    
    toast({
      title: "Estante cancelado",
      description: "Se han descartado todos los productos escaneados"
    });
  }, [scannedProducts.length, changeUiState, setCurrentShelfId]);

  // Switch between scanning and reviewing modes
  const toggleScanningMode = useCallback((isReviewing: boolean) => {
    console.log(`toggleScanningMode called with isReviewing=${isReviewing}`);
    
    if (isReviewing) {
      changeUiState('reviewing_shelf');
      
      // When switching to review mode, show a toast notification
      toast({
        title: "Modo de revisión activado",
        description: "Revisando productos escaneados"
      });
    } else {
      changeUiState('scanning_active');
      
      // When switching back to scanning mode, show a toast notification
      toast({
        title: "Modo de escaneo activado",
        description: "Escanee productos para añadirlos al estante"
      });
    }
  }, [changeUiState]);

  // End the entire organization event
  const endOrganizationEvent = useCallback(() => {
    if (scannedProducts.length > 0) {
      if (!window.confirm('¿Desea terminar el evento sin guardar los cambios en el estante actual?')) {
        return;
      }
    }
    
    resetOrganizationEvent();
    
    toast({
      title: "Evento de organización finalizado",
      description: "Todos los datos han sido guardados"
    });
  }, [scannedProducts.length, resetOrganizationEvent]);

  return {
    startNewShelf,
    cancelCurrentShelf,
    toggleScanningMode,
    endOrganizationEvent
  };
}
