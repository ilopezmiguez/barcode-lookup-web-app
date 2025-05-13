
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useShelfOrganizer } from '@/hooks/useShelfOrganizer';
import { Save, X, CircleCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ScanningInterface() {
  const { 
    currentShelfId, 
    scannedProducts, 
    handleProductScan, 
    saveShelf, 
    cancelCurrentShelf,
    isLoading 
  } = useShelfOrganizer();
  
  const [isScanning, setIsScanning] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-primary/10 p-3 rounded-md">
        <span className="font-medium">
          Estante: <span className="font-bold text-primary">{currentShelfId}</span>
        </span>
        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
          {scannedProducts.length} productos
        </span>
      </div>
      
      {/* Scanner */}
      <div className="mb-4">
        <BarcodeScanner 
          onBarcodeDetected={handleProductScan} 
          isScanning={isScanning} 
        />
      </div>
      
      {/* Scanner Controls */}
      <div className="flex justify-center gap-2 mb-2">
        <Button 
          variant="outline" 
          onClick={() => setIsScanning(!isScanning)}
        >
          {isScanning ? 'Pausar Escáner' : 'Reanudar Escáner'}
        </Button>
      </div>
      
      {/* Scanned Items List */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <h3 className="font-medium mb-2">Productos escaneados ({scannedProducts.length})</h3>
          {scannedProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-2">
              No hay productos escaneados aún
            </p>
          ) : (
            <ScrollArea className="h-52">
              <div className="space-y-1">
                {scannedProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <CircleCheck size={16} className="text-green-500" />
                      <span className="font-mono">{product.barcode}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
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
