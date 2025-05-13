
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the types for our scanned products
export interface ScannedProduct {
  barcode: string;
  timestamp: Date;
  productName?: string | null;
}

// Define the possible UI states for the organization flow
export type OrganizerUIState = 
  | 'idle'                // No organization event is active
  | 'awaiting_shelf_id'   // Event started, waiting for shelf ID input
  | 'scanning_active'     // Actively scanning products for a shelf
  | 'reviewing_shelf'     // Reviewing scanned products (after expanding during scanning)
  | 'shelf_saved_options'; // After saving a shelf, showing options for next steps

// Define the shape of our context
interface OrganizationContextType {
  // Event state
  isOrganizing: boolean;
  currentEventId: string | null;
  currentShelfId: string;
  scannedProducts: ScannedProduct[];
  uiState: OrganizerUIState;
  isLoading: boolean;
  
  // Actions
  startOrganizationEvent: () => void;
  startShelfScan: (shelfId: string) => void;
  handleProductScan: (barcode: string) => Promise<void>;
  saveShelf: () => Promise<void>;
  startNewShelf: () => void;
  cancelCurrentShelf: () => void;
  endOrganizationEvent: () => void;
  
  // Manager tools UI state
  collapseManagerTools: () => void;
  expandManagerTools: () => void;
}

// Create the context with a default undefined value
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Create a provider component
export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Main event state
  const [isOrganizing, setIsOrganizing] = useState<boolean>(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [currentShelfId, setCurrentShelfId] = useState<string>('');
  const [scannedProducts, setScannedProducts] = useState<ScannedProduct[]>([]);
  const [uiState, setUiState] = useState<OrganizerUIState>('idle');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Manager tools collapse state - this will be controlled by the context
  const [isManagerToolsCollapsed, setIsManagerToolsCollapsed] = useState<boolean>(true);
  
  const { toast } = useToast();
  
  // Helper function to toggle Manager Tools
  const collapseManagerTools = useCallback(() => {
    console.log("Collapsing manager tools");
    setIsManagerToolsCollapsed(true);
  }, []);
  
  const expandManagerTools = useCallback(() => {
    console.log("Expanding manager tools");
    setIsManagerToolsCollapsed(false);
    
    // If we're in scanning_active state and the user expands the menu,
    // transition to reviewing_shelf state
    if (uiState === 'scanning_active') {
      console.log("Transitioning from scanning_active to reviewing_shelf");
      setUiState('reviewing_shelf');
    }
  }, [uiState]);

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
    
    console.log("Setting current shelf ID to:", shelfId);
    setCurrentShelfId(shelfId);
    setScannedProducts([]);
    setUiState('scanning_active');
    
    // Collapse Manager Tools when scanning starts
    collapseManagerTools();
    
    toast({
      title: "Escaneo iniciado",
      description: `Escaneando productos para el estante: ${shelfId}`
    });
  }, [toast, collapseManagerTools]);

  // Helper function to look up product names
  const lookupProductName = async (barcode: string): Promise<string | null> => {
    try {
      console.log("Looking up product name for barcode:", barcode);
      const { data } = await supabase
        .from('products')
        .select('product_name')
        .eq('barcode_number', barcode)
        .single();
      
      console.log("Product lookup result:", data);
      return data?.product_name || null;
    } catch (error) {
      console.log('Product lookup error:', error);
      return null;
    }
  };

  // Handle a barcode scan
  const handleProductScan = useCallback(async (barcode: string) => {
    console.log(`Organization Context: handleProductScan called with barcode ${barcode}`);
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
    
    // Provide feedback through toast
    console.log("Product added to scanned products list");
    
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
  }, [isOrganizing, uiState, currentShelfId, scannedProducts, toast]);

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

  // Prepare the context value
  const contextValue: OrganizationContextType = {
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
    endOrganizationEvent,
    
    // Manager tools UI state
    collapseManagerTools,
    expandManagerTools
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Create a custom hook to use the context
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
