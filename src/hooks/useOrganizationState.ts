
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { lookupProductName, saveShelfProducts } from '@/services/organizationService';
import { ScannedProduct, OrganizerUIState } from '@/types/organization';

export function useOrganizationState() {
  // Main event state
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentShelfId, setCurrentShelfId] = useState<string>('');
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [uiState, setUiState] = useState<OrganizerUIState>('idle');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Start a new organization event
  const startOrganizationEvent = useCallback(() => {
    // Generate a random 8-digit event ID
    const eventId = Math.floor(10000000 + Math.random() * 90000000).toString();
    setCurrentEventId(eventId);
    setIsOrganizing(true);
    setUiState('awaiting_shelf_id');
    setCurrentShelfId('');
    setScannedProducts([]);
    
    toast({
      title: "Evento de organización iniciado",
      description: `ID del evento: ${eventId}`
    });
  }, []);

  // Begin scanning for a specific shelf
  const startShelfScan = useCallback((shelfId: string) => {
    if (!shelfId.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un código de estante válido",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Setting current shelf ID to:", shelfId);
    setCurrentShelfId(shelfId);
    setScannedProducts([]);
    setUiState('scanning_active');
    
    toast({
      title: "Escaneo iniciado",
      description: `Escaneando productos para el estante: ${shelfId}`
    });
  }, []);

  // Handle a barcode scan
  const handleProductScan = useCallback(async (barcode: string) => {
    console.log(`useOrganizationState: handleProductScan called with barcode ${barcode}`);
    console.log(`Current state: isOrganizing=${isOrganizing}, uiState=${uiState}, currentShelfId=${currentShelfId}`);
    
    if (!isOrganizing) {
      console.log("Not organizing, ignoring barcode");
      return;
    }
    
    if (uiState !== 'scanning_active' && uiState !== 'reviewing_shelf') {
      console.log("Not in scanning_active or reviewing_shelf state, ignoring barcode");
      return;
    }

    console.log(`Adding product: ${barcode} for shelf: ${currentShelfId}`);
    
    // Check if this barcode has already been scanned
    const isDuplicate = scannedProducts.some(product => product.barcode === barcode);
    
    if (isDuplicate) {
      console.log("Duplicate barcode, not adding to list");
      toast({
        title: "Producto ya escaneado",
        description: `El código ${barcode} ya ha sido escaneado`,
        variant: "default"
      });
      return;
    }
    
    // Add the new product (we'll update with product name asynchronously)
    const newProduct = {
      barcode,
      timestamp: new Date(),
      productName: null // Will be updated when lookup completes
    };
    
    console.log("Adding new product to scannedProducts:", newProduct);
    setScannedProducts(prev => [...prev, newProduct]);
    
    // Try to find the product name in the database
    const productName = await lookupProductName(barcode);
    if (productName) {
      console.log(`Found product name: ${productName} for barcode: ${barcode}`);
      // Update the product with its name if found
      setScannedProducts(current => 
        current.map(p => 
          p.barcode === barcode 
            ? { ...p, productName } 
            : p
        )
      );
    }
  }, [isOrganizing, uiState, currentShelfId, scannedProducts]);

  // Save the current shelf to Supabase
  const saveShelf = useCallback(async () => {
    if (!currentEventId || !currentShelfId || scannedProducts.length === 0) {
      toast({
        title: "Error al guardar",
        description: "No hay productos escaneados para guardar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await saveShelfProducts(currentEventId, currentShelfId, scannedProducts);
      
      if (!result.success) {
        throw result.error;
      }
      
      toast({
        title: "Estante guardado exitosamente",
        description: `Estante '${currentShelfId}' guardado con ${scannedProducts.length} productos.`
      });
      
      // Reset for next shelf
      setScannedProducts([]);
      setUiState('shelf_saved_options');
    } catch (error) {
      console.error('Error saving shelf:', error);
      toast({
        title: "Error al guardar el estante",
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentEventId, currentShelfId, scannedProducts]);

  // Start a new shelf after saving the previous one
  const startNewShelf = useCallback(() => {
    setCurrentShelfId('');
    setScannedProducts([]);
    setUiState('awaiting_shelf_id');
  }, []);

  // Cancel the current shelf without saving
  const cancelCurrentShelf = useCallback(() => {
    if (scannedProducts.length > 0) {
      if (!window.confirm('¿Está seguro que desea cancelar el estante actual? Se perderán todos los productos escaneados.')) {
        return;
      }
    }
    
    setCurrentShelfId('');
    setScannedProducts([]);
    setUiState('awaiting_shelf_id');
    
    toast({
      title: "Estante cancelado",
      description: "Se han descartado todos los productos escaneados"
    });
  }, [scannedProducts.length]);

  // End the entire organization event
  const endOrganizationEvent = useCallback(() => {
    if (scannedProducts.length > 0) {
      if (!window.confirm('¿Desea terminar el evento sin guardar los cambios en el estante actual?')) {
        return;
      }
    }
    
    setIsOrganizing(false);
    setCurrentEventId(null);
    setCurrentShelfId('');
    setScannedProducts([]);
    setUiState('idle');
    
    toast({
      title: "Evento de organización finalizado",
      description: "Todos los datos han sido guardados"
    });
  }, [scannedProducts.length]);

  return {
    // State
    isOrganizing,
    currentEventId,
    currentShelfId,
    scannedProducts,
    uiState,
    isLoading,
    
    // Actions
    startOrganizationEvent,
    startShelfScan,
    handleProductScan,
    saveShelf,
    startNewShelf,
    cancelCurrentShelf,
    endOrganizationEvent
  };
}
