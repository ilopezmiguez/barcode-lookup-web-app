import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDisplay from '@/components/ProductDisplay';
import { Barcode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import ManagerTools from '@/components/ManagerTools';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useProductScanning } from '@/hooks/useProductScanning';
import { BarcodeHandlingMode } from '@/services/barcodeRoutingService';
import ScanningInterface from '@/components/ScanningInterface';

interface Product {
  product_name: string;
  price: number;
  barcode_number: string;
  category?: string | null;
}

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Get the organization context
  const { isOrganizing, uiState } = useOrganization();
  
  // When the user is in organization mode and scanning is active, we need to handle it differently
  const isOrganizationScanning = isOrganizing && (uiState === 'scanning_active' || uiState === 'reviewing_shelf');
  
  // Define product lookup function
  const lookupProduct = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    try {
      const {
        data,
        error
      } = await supabase.from('products').select('product_name, price, barcode_number, category').eq('barcode_number', barcode).maybeSingle();
      
      if (error) {
        console.error('Supabase query error:', error);

        // Check if it's a "not found" error
        if (error.code === 'PGRST116') {
          // This is not really an error, just no results
          setProduct(null);
        } else {
          // This is an actual error
          setError(`Error de base de datos: ${error.message}`);
          toast({
            title: "Error al buscar producto",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data) {
        setProduct(data);
        toast({
          title: "Producto encontrado",
          description: `Se encontró ${data.product_name}`
        });
      }
    } catch (err) {
      console.error('Product lookup error:', err);
      setError('No se pudo buscar el producto. Por favor verifica tu conexión e intenta de nuevo.');
      if (err instanceof Error) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle product scan in normal mode
  const handleProductScan = async (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScanning(false); // Pause scanning while looking up the product
    await lookupProduct(barcode);
  };
  
  // Use our product scanning hook - only for product lookup mode
  const { handleBarcodeScan } = useProductScanning({
    onProductScan: handleProductScan,
    mode: BarcodeHandlingMode.PRODUCT_LOOKUP,
    enabled: !isOrganizationScanning && isScanning
  });
  
  const startScanning = () => {
    setIsScanning(true);
  };
  
  const resetScanner = () => {
    setScannedBarcode(null);
    setProduct(null);
    setError(null);
    setIsScanning(true);
  };

  // Handle history item selection
  const handleHistoryItemClick = (historyProduct: Product) => {
    setProduct(historyProduct);
    setScannedBarcode(historyProduct.barcode_number);
    // No need to fetch from the database again as we already have the product data
  };

  // Handle barcode detection
  const onBarcodeDetected = async (barcode: string) => {
    console.log("Index detected barcode:", barcode);
    // Only process in normal mode
    if (!isOrganizationScanning) {
      await handleBarcodeScan(barcode);
    }
  };

  // Initialize scanning when the component mounts or when organization scanning changes
  useEffect(() => {
    if (!isOrganizationScanning && !isScanning && !scannedBarcode) {
      // In normal mode, follow the regular rules
      startScanning();
    }
  }, [isOrganizationScanning, isScanning, scannedBarcode]);

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-16">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Barcode className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold">Product Scanner</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Escanea el código de barras de un producto para ver los detalles de nuestra base de datos
            </p>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Main Content Area - Show Organization UI or Normal Scanner */}
        {isOrganizationScanning ? (
          <ScanningInterface />
        ) : (
          <>
            {/* Scanner - Only display in normal mode */}
            <div className="mb-6">
              <BarcodeScanner 
                onBarcodeDetected={onBarcodeDetected} 
                isScanning={isScanning} 
              />
            </div>
            
            {/* Product Information */}
            <div className="mb-6">
              <ProductDisplay 
                product={product} 
                isLoading={isLoading} 
                error={error} 
                scannedBarcode={scannedBarcode}
                onHistoryItemClick={handleHistoryItemClick} 
              />
            </div>
            
            {/* Controls */}
            <div className="mt-6 flex justify-center space-x-4">
              {!isScanning && (
                <Button onClick={startScanning} disabled={isLoading}>
                  Continuar Escaneando
                </Button>
              )}
              
              {scannedBarcode && (
                <Button onClick={resetScanner} variant="outline" disabled={isLoading}>
                  Escanear Nuevo Código
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Manager Tools - Always visible */}
      <ManagerTools />
    </div>
  );
};

export default Index;
