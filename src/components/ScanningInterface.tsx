
import React, { useState, useEffect } from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useProductScanning } from '@/hooks/useProductScanning';
import { BarcodeHandlingMode } from '@/services/barcodeRoutingService';
import { useIsMobile } from '@/hooks/use-mobile';

// Import new component files
import FloatingExpandButton from '@/components/scanner/FloatingExpandButton';
import CompactProductsList from '@/components/scanner/CompactProductsList';
import ShelfHeader from '@/components/scanner/ShelfHeader';
import ScanControls from '@/components/scanner/ScanControls';
import ShelfActions from '@/components/scanner/ShelfActions';

export default function ScanningInterface() {
  const { 
    currentShelfId, 
    scannedProducts, 
    saveShelf, 
    cancelCurrentShelf,
    isLoading,
    uiState,
    toggleScanningMode,
    handleProductScan,
    isManagerToolsOpen,
    expandManagerTools
  } = useOrganization();
  
  const [isScanning, setIsScanning] = useState(true);
  const isMobile = useIsMobile();
  
  // Determine if we're in active scanning or reviewing mode
  const isReviewing = uiState === 'reviewing_shelf';

  // Use our product scanning hook - explicitly for organization mode
  const { handleBarcodeScan } = useProductScanning({
    onProductScan: handleProductScan,
    mode: BarcodeHandlingMode.SHELF_ORGANIZATION,
    enabled: !isReviewing && isScanning
  });

  // Handle barcode detection from scanner component
  const onBarcodeDetected = async (barcode: string) => {
    console.log("ScanningInterface detected barcode:", barcode);
    if (!isReviewing && isScanning) {
      await handleBarcodeScan(barcode);
    }
  };

  // Toggle scanning state
  const toggleScanning = () => {
    console.log(`Toggling scanning state from ${isScanning} to ${!isScanning}`);
    setIsScanning(!isScanning);
  };

  // Ensure scanner visibility when appropriate
  useEffect(() => {
    console.log("ScanningInterface: UI state changed to", uiState);
    
    // When returning to scanning_active, always ensure scanning is enabled
    if (uiState === 'scanning_active') {
      console.log("Activating scanner for scanning_active state");
      setIsScanning(true);
    }
  }, [uiState]);

  return (
    <div className="space-y-4 pb-20">
      {/* Floating elements */}
      <FloatingExpandButton 
        isVisible={!isManagerToolsOpen && scannedProducts.length > 0} 
        productCount={scannedProducts.length}
        onClick={expandManagerTools}
      />
      
      <CompactProductsList 
        isVisible={!isManagerToolsOpen} 
        products={scannedProducts}
        onExpand={expandManagerTools}
      />
      
      {/* Shelf header */}
      <ShelfHeader 
        shelfId={currentShelfId}
        isReviewing={isReviewing}
        productCount={scannedProducts.length}
      />
      
      {/* Scanner - Show when scanning is active and not in review mode */}
      {!isReviewing && (
        <div className="mb-4">
          <BarcodeScanner 
            onBarcodeDetected={onBarcodeDetected} 
            isScanning={isScanning} 
          />
        </div>
      )}
      
      {/* Scanner Controls - Only show when actively scanning */}
      <ScanControls 
        isScanning={isScanning}
        onToggleScan={toggleScanning}
        showControls={!isReviewing}
      />
      
      {/* Action Buttons */}
      <ShelfActions 
        onCancel={cancelCurrentShelf}
        onSave={saveShelf}
        productCount={scannedProducts.length}
        isLoading={isLoading}
      />
    </div>
  );
}
