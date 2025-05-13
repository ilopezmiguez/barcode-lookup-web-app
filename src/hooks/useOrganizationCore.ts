
import { useState, useCallback } from 'react';
import { ScannedProduct, OrganizerUIState } from '@/types/organization';
import { toast } from '@/hooks/use-toast';
import { transition, stateDescriptions } from '@/lib/organizationStateMachine';

/**
 * Core organization state and simple actions
 */
export function useOrganizationCore() {
  // Main event state
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentShelfId, setCurrentShelfId] = useState<string>('');
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [uiState, setUiState] = useState<OrganizerUIState>('idle');
  
  // Start a new organization event
  const startOrganizationEvent = useCallback(() => {
    // Generate a random 8-digit event ID
    const eventId = Math.floor(10000000 + Math.random() * 90000000).toString();
    setCurrentEventId(eventId);
    setIsOrganizing(true);
    changeUiState('awaiting_shelf_id');
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
    changeUiState('scanning_active');
    
    toast({
      title: "Escaneo iniciado",
      description: `Escaneando productos para el estante: ${shelfId}`
    });
  }, []);

  // Add a product to the scanned products list
  const addScannedProduct = useCallback((product: ScannedProduct) => {
    console.log("Adding scanned product:", product);
    setScannedProducts(prev => [...prev, product]);
  }, []);

  // Update a product in the scanned products list
  // Modified to work with duplicate barcodes by using timestamps to match
  const updateScannedProduct = useCallback((barcode: string, updates: Partial<ScannedProduct>) => {
    console.log(`Updating scanned product with barcode ${barcode}:`, updates);
    setScannedProducts(current => {
      // Find the most recent product with this barcode to update
      const productsWithBarcode = current.filter(p => p.barcode === barcode);
      if (productsWithBarcode.length === 0) return current;
      
      // Sort by timestamp (newest first) to get the most recent product
      productsWithBarcode.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const mostRecentTimestamp = productsWithBarcode[0].timestamp;
      
      // Update the most recent product with this barcode
      return current.map(p => 
        p.barcode === barcode && p.timestamp.getTime() === mostRecentTimestamp.getTime()
          ? { ...p, ...updates } 
          : p
      );
    });
  }, []);

  // Check if a product has already been scanned
  // Still useful for notification purposes
  const isProductAlreadyScanned = useCallback((barcode: string) => {
    return scannedProducts.some(product => product.barcode === barcode);
  }, [scannedProducts]);

  // Change the UI state using the state machine
  const changeUiState = useCallback((newState: OrganizerUIState) => {
    console.log(`Attempting UI state transition: ${uiState} → ${newState} (${stateDescriptions[newState]})`);
    setUiState(currentState => transition(currentState, newState));
  }, [uiState]);

  // Reset the organization event
  const resetOrganizationEvent = useCallback(() => {
    setIsOrganizing(false);
    setCurrentEventId(null);
    setCurrentShelfId('');
    setScannedProducts([]);
    changeUiState('idle');
  }, [changeUiState]);

  return {
    // State
    isOrganizing,
    currentEventId,
    currentShelfId,
    scannedProducts,
    uiState,
    
    // Actions
    startOrganizationEvent,
    startShelfScan,
    addScannedProduct,
    updateScannedProduct,
    isProductAlreadyScanned,
    changeUiState,
    resetOrganizationEvent,
    setCurrentShelfId,
  };
}
