
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Save, X, CircleCheck, PackageSearch, Expand, Minimize, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProductScanning } from '@/hooks/useProductScanning';
import { BarcodeHandlingMode } from '@/services/barcodeRoutingService';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const scanningTitle = isReviewing ? "Revisando productos para" : "Escaneando productos para";

  // Define the toggleView function
  const toggleView = () => {
    toggleScanningMode(!isReviewing);
  };

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

  // Floating manager tools expander button
  const FloatingExpandButton = () => (
    !isManagerToolsOpen && (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          size="sm"
          variant="secondary"
          className="h-10 shadow-md rounded-full flex items-center gap-1"
          onClick={expandManagerTools}
        >
          <ChevronUp size={15} />
          <span className="font-medium">Ver Lista ({scannedProducts.length})</span>
        </Button>
      </div>
    )
  );
  
  // Only show compact list when manager tools are collapsed and we have products
  const CompactProductsList = () => (
    !isManagerToolsOpen && scannedProducts.length > 0 ? (
      <div className="fixed top-4 left-4 right-4 z-30 bg-background/80 backdrop-blur-sm rounded-lg shadow-md p-2 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Último producto: {scannedProducts[0]?.productName || scannedProducts[0]?.barcode}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={expandManagerTools}
            className="h-7 px-2"
          >
            <Expand size={14} className="mr-1" />
            <span className="text-xs">Expandir</span>
          </Button>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Floating elements */}
      <FloatingExpandButton />
      <CompactProductsList />
      
      <div className="flex items-center justify-between bg-primary/10 p-3 rounded-md">
        <span className="font-medium">
          {scanningTitle} <span className="font-bold text-primary">{currentShelfId}</span>
        </span>
        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {scannedProducts.length} productos
        </span>
      </div>
      
      {/* Scanner - Only show when actively scanning */}
      {!isReviewing && (
        <div className="mb-4">
          <BarcodeScanner 
            onBarcodeDetected={onBarcodeDetected} 
            isScanning={isScanning} 
          />
        </div>
      )}
      
      {/* Scanner Controls - Only show when actively scanning */}
      {!isReviewing && (
        <div className="flex justify-center gap-2 mb-2">
          <Button 
            variant="outline" 
            onClick={() => setIsScanning(!isScanning)}
          >
            {isScanning ? 'Pausar Escáner' : 'Reanudar Escáner'}
          </Button>
        </div>
      )}
      
      {/* Scanned Items List - Only show when manager tools are open or in review mode */}
      {(isManagerToolsOpen || isReviewing) && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Productos escaneados ({scannedProducts.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleView}
                className="h-8 px-2"
              >
                {isReviewing ? (
                  <>
                    <Minimize size={16} className="mr-1" />
                    Volver al Escaneo
                  </>
                ) : (
                  <>
                    <Expand size={16} className="mr-1" />
                    Expandir Lista
                  </>
                )}
              </Button>
            </div>
            
            {scannedProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-2">
                No hay productos escaneados aún
              </p>
            ) : (
              <ScrollArea className={isReviewing ? "h-96" : "h-52"}>
                <div className="space-y-1">
                  {scannedProducts.map((product, idx) => (
                    <div key={`${product.barcode}-${product.timestamp.getTime()}`} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <CircleCheck size={16} className="text-green-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-xs truncate">{product.barcode}</div>
                          <div className="truncate text-sm">
                            {product.productName ? (
                              product.productName
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground italic">
                                <PackageSearch size={12} />
                                Buscando...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(product.timestamp, { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-3 pb-4">
        <Button 
          variant="destructive" 
          onClick={cancelCurrentShelf} 
          className="flex-1"
          disabled={isLoading}
        >
          <X size={18} className="mr-1" />
          Borrar Estante
        </Button>
        
        <Button 
          onClick={saveShelf} 
          className="flex-1"
          disabled={scannedProducts.length === 0 || isLoading}
        >
          <Save size={18} className="mr-1" />
          {isLoading ? 'Guardando...' : 'Guardar Estante'}
        </Button>
      </div>
    </div>
  );
}
