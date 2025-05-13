
import { useCallback, useEffect } from 'react';
import { BarcodeHandlingMode, barcodeRouter } from '@/services/barcodeRoutingService';

/**
 * Hook to manage barcode routing configuration
 */
export function useBarcodeRouter({ 
  mode = BarcodeHandlingMode.PRODUCT_LOOKUP,
  onProductLookup,
  onShelfOrganization,
  enabled = true
}: {
  mode: BarcodeHandlingMode;
  onProductLookup?: (barcode: string) => Promise<void>;
  onShelfOrganization?: (barcode: string) => Promise<void>;
  enabled?: boolean;
}) {
  // Configure the barcode router
  useEffect(() => {
    if (!enabled) return;
    
    console.log(`Setting barcode router to ${mode} mode`);
    barcodeRouter.updateConfig({
      mode,
      onProductLookup,
      onShelfOrganization
    });
    
    // Clean up on unmount or when dependencies change
    return () => {
      console.log("Resetting barcode router configuration");
      barcodeRouter.reset();
    };
  }, [mode, onProductLookup, onShelfOrganization, enabled]);

  // Expose a method to handle barcode scans directly
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    if (!enabled) return;
    await barcodeRouter.handleBarcodeScan(barcode);
  }, [enabled]);

  return {
    handleBarcodeScan
  };
}
