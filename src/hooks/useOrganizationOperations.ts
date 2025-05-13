
import { useCallback, useState } from 'react';
import { lookupProductName, saveShelfProducts } from '@/services/organizationService';
import { ScannedProduct } from '@/types/organization';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for complex organization operations like product scanning and saving shelves
 */
export function useOrganizationOperations(
  currentEventId: string | null,
  currentShelfId: string,
  scannedProducts: ScannedProduct[],
  isProductAlreadyScanned: (barcode: string) => boolean,
  addScannedProduct: (product: ScannedProduct) => void,
  updateScannedProduct: (barcode: string, updates: Partial<ScannedProduct>) => void,
  changeUiState: (newState: import('@/types/organization').OrganizerUIState) => void
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle a barcode scan during organization
  const handleProductScan = useCallback(async (barcode: string) => {
    console.log(`useOrganizationOperations: handleProductScan called with barcode ${barcode}`);
    
    if (!barcode || barcode.trim() === '') {
      console.log("Empty barcode detected, ignoring");
      return;
    }
    
    // Check if this barcode has already been scanned
    if (isProductAlreadyScanned(barcode)) {
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
    addScannedProduct(newProduct);
    
    try {
      // Try to find the product name in the database
      const productName = await lookupProductName(barcode);
      if (productName) {
        console.log(`Found product name: ${productName} for barcode: ${barcode}`);
        // Update the product with its name if found
        updateScannedProduct(barcode, { productName });
      }
    } catch (error) {
      console.error("Error looking up product name:", error);
    }
  }, [isProductAlreadyScanned, addScannedProduct, updateScannedProduct]);

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
        const errorMessage = result.error?.message || 
                            result.error?.details || 
                            result.error || 
                            'Error desconocido';
        
        toast({
          title: "Error al guardar el estante",
          description: errorMessage,
          variant: "destructive"
        });
        console.error('Detailed save error:', result.error);
        return;
      }
      
      toast({
        title: "Estante guardado exitosamente",
        description: `Estante '${currentShelfId}' guardado con ${scannedProducts.length} productos.`
      });
      
      // Change UI state to show options after saving
      changeUiState('shelf_saved_options');
    } catch (error) {
      console.error('Error saving shelf:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error al guardar el estante",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentEventId, currentShelfId, scannedProducts, changeUiState]);

  return {
    isLoading,
    handleProductScan,
    saveShelf
  };
}
