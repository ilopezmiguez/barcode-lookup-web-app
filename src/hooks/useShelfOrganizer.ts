
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ScannedProduct {
  barcode: string;
  timestamp: Date;
  productName?: string | null;
}

export type OrganizerUIState = 
  | 'idle'
  | 'awaiting_shelf_id'
  | 'scanning_shelf'
  | 'shelf_saved_options';

export function useShelfOrganizer() {
  // Main event state
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentShelfId, setCurrentShelfId] = useState<string>('');
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [uiState, setUiState] = useState<OrganizerUIState>('idle');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { toast } = useToast();

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
  }, [toast]);

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
    
    setCurrentShelfId(shelfId);
    setScannedProducts([]);
    setUiState('scanning_shelf');
    
    toast({
      title: "Escaneo iniciado",
      description: `Escaneando productos para el estante: ${shelfId}`
    });
  }, [toast]);

  // Handle a barcode scan
  const handleProductScan = useCallback(async (barcode: string) => {
    if (!isOrganizing || uiState !== 'scanning_shelf') {
      return;
    }

    console.log(`Scanning product: ${barcode} for shelf: ${currentShelfId}`);
    
    setScannedProducts(prev => {
      // Check if this barcode has already been scanned
      const isDuplicate = prev.some(product => product.barcode === barcode);
      
      if (isDuplicate) {
        toast({
          title: "Producto ya escaneado",
          description: `El código ${barcode} ya ha sido escaneado`,
          variant: "default"
        });
        return prev;
      }
      
      // Try to find the product name in the database
      lookupProductName(barcode).then(productName => {
        if (productName) {
          // Update the product with its name if found
          setScannedProducts(current => 
            current.map(p => 
              p.barcode === barcode 
                ? { ...p, productName } 
                : p
            )
          );
        }
      });
      
      // Add the new product (we'll update with product name asynchronously)
      const newProducts = [...prev, { 
        barcode, 
        timestamp: new Date(),
        productName: null // Will be updated when lookup completes
      }];
      
      // Provide feedback through toast
      toast({
        title: "Producto escaneado",
        description: `Código: ${barcode}`,
        duration: 1500
      });
      
      return newProducts;
    });
  }, [isOrganizing, uiState, currentShelfId, toast]);

  // Helper function to look up product names
  const lookupProductName = async (barcode: string): Promise<string | null> => {
    try {
      const { data } = await supabase
        .from('products')
        .select('product_name')
        .eq('barcode_number', barcode)
        .single();
      
      return data?.product_name || null;
    } catch (error) {
      console.log('Product lookup error:', error);
      return null;
    }
  };

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
      // Prepare data for bulk insert
      const productsToInsert = scannedProducts.map(product => ({
        shelf: currentShelfId,
        barcode_number: product.barcode,
        event_id: currentEventId
      }));
      
      console.log("Saving shelf with products:", productsToInsert);
      
      // Bulk insert into org_products table
      const { error } = await supabase
        .from('org_products')
        .insert(productsToInsert);
      
      if (error) {
        throw error;
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
  }, [currentEventId, currentShelfId, scannedProducts, toast]);

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
  }, [scannedProducts.length, toast]);

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
  }, [scannedProducts.length, toast]);

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
