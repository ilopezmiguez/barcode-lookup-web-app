
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Save, X, CircleCheck, PackageSearch, Expand, Minimize } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { barcodeRouter } from '@/services/barcodeRoutingService';

export default function ScanningInterface() {
  const { 
    currentShelfId, 
    scannedProducts, 
    saveShelf, 
    cancelCurrentShelf,
    isLoading,
    uiState,
    expandManagerTools,
    toggleScanningMode
  } = useOrganization();
  
  const [isScanning, setIsScanning] = useState(true);
  
  // Determine if we're in active scanning or reviewing mode
  const isReviewing = uiState === 'reviewing_shelf';
  const scanningTitle = isReviewing ? "Revisando productos para" : "Escaneando productos para";
  
  // Toggle between scanning and reviewing modes
  const toggleView = () => {
    if (isReviewing) {
      toggleScanningMode(false); // Switch to scanning mode
    } else {
      expandManagerTools(); // This will trigger transition to reviewing mode
    }
  };

  const onBarcodeDetected = async (barcode: string) => {
    console.log("ScanningInterface detected barcode:", barcode);
    
    // We now use the centralized barcode router
    // The router will handle routing to the appropriate handler
    await barcodeRouter.handleBarcodeScan(barcode);
    
    // Provide immediate feedback with toast
    toast({
      title: "Producto escaneado",
      description: `Código: ${barcode}`,
      duration: 1500
    });
  };

  // Clean up barcode router on unmount
  useEffect(() => {
    return () => {
      barcodeRouter.reset();
    };
  }, []);

  return (
    <div className="space-y-4">
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
      
      {/* Scanned Items List */}
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
                  <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded">
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
