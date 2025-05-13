
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useBarcodeRouter } from '@/hooks/useBarcodeRouter';
import { BarcodeHandlingMode } from '@/services/barcodeRoutingService';

/**
 * Hook for managing product scanning functionality
 */
export function useProductScanning({
  onProductScan,
  mode = BarcodeHandlingMode.PRODUCT_LOOKUP,
  showToast = true,
  enabled = true
}: {
  onProductScan?: (barcode: string) => Promise<void>;
  mode?: BarcodeHandlingMode;
  showToast?: boolean;
  enabled?: boolean;
}) {
  // Notification handler for barcode scans
  const handleBarcodeScanNotification = useCallback((barcode: string) => {
    if (!showToast) return;
    
    toast({
      title: "Código escaneado",
      description: `${barcode}`,
      duration: 1500
    });
  }, [showToast]);
  
  // Set up the barcode router with our handlers
  const { handleBarcodeScan } = useBarcodeRouter({
    mode,
    onProductLookup: async (barcode: string) => {
      console.log("Product lookup handler called with barcode:", barcode);
      handleBarcodeScanNotification(barcode);
      if (onProductScan && mode === BarcodeHandlingMode.PRODUCT_LOOKUP) {
        await onProductScan(barcode);
      }
    },
    onShelfOrganization: async (barcode: string) => {
      console.log("Shelf organization handler called with barcode:", barcode);
      handleBarcodeScanNotification(barcode);
      if (onProductScan && mode === BarcodeHandlingMode.SHELF_ORGANIZATION) {
        await onProductScan(barcode);
      }
    },
    enabled
  });
  
  return {
    handleBarcodeScan
  };
}
