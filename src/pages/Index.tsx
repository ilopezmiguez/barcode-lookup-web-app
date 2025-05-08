
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDisplay from '@/components/ProductDisplay';
import { Barcode } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import ManagerTools from '@/components/ManagerTools';

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

  const handleBarcodeDetected = async (barcode: string) => {
    // Only process if it's a new barcode or first scan
    if (barcode !== scannedBarcode) {
      setScannedBarcode(barcode);
      setIsScanning(false); // Pause scanning while looking up the product
      await lookupProduct(barcode);
    }
  };

  const lookupProduct = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    setProduct(null);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('product_name, price, barcode_number, category')
        .eq('barcode_number', barcode)
        .single();
      
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
          description: `Se encontró ${data.product_name}`,
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

  // Initialize scanning when the component mounts
  useEffect(() => {
    if (!isScanning && !scannedBarcode) {
      startScanning();
    }
  }, []);

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
        
        {/* Scanner */}
        <div className="mb-6">
          <BarcodeScanner 
            onBarcodeDetected={handleBarcodeDetected} 
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
            <Button 
              onClick={startScanning} 
              disabled={isLoading}
            >
              Continuar Escaneando
            </Button>
          )}
          
          {scannedBarcode && (
            <Button 
              onClick={resetScanner} 
              variant="outline"
              disabled={isLoading}
            >
              Escanear Nuevo Código
            </Button>
          )}
        </div>
        
        {/* Development info */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          <p>Nota: Por favor conecta a Supabase y configura tu base de datos de productos.</p>
          <p className="mt-1">Asegúrate de añadir el campo 'category' a tu tabla de productos.</p>
        </div>
      </div>
      
      {/* Manager Tools */}
      <ManagerTools />
    </div>
  );
};

export default Index;
