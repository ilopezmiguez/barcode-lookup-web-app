import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import BarcodeScanner from '@/components/BarcodeScanner';
import ProductDisplay from '@/components/ProductDisplay';
import { Barcode } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface Product {
  product_name: string;
  price: number;
  barcode_number: string;
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
      // Query the Supabase database for the product
      const { data, error } = await supabase
        .from('products')
        .select('product_name, price, barcode_number')
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
          setError(`Database error: ${error.message}`);
          toast({
            title: "Error looking up product",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data) {
        setProduct(data);
        toast({
          title: "Product found",
          description: `Found ${data.product_name}`,
        });
      }
    } catch (err) {
      console.error('Product lookup error:', err);
      setError('Failed to look up product. Please check your connection and try again.');
      
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

  // Initialize scanning when the component mounts
  useEffect(() => {
    if (!isScanning && !scannedBarcode) {
      startScanning();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Barcode className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Product Scanner</h1>
          </div>
          <p className="text-gray-600">
            Scan a product barcode to view details from our database
          </p>
        </div>
        
        {/* Scanner */}
        <BarcodeScanner 
          onBarcodeDetected={handleBarcodeDetected} 
          isScanning={isScanning} 
        />
        
        {/* Product Information */}
        <ProductDisplay 
          product={product} 
          isLoading={isLoading} 
          error={error}
          scannedBarcode={scannedBarcode}
        />
        
        {/* Controls */}
        <div className="mt-6 flex justify-center space-x-4">
          {!isScanning && (
            <Button 
              onClick={startScanning} 
              variant="outline"
              className="bg-blue-500 text-white hover:bg-blue-600"
              disabled={isLoading}
            >
              Resume Scanning
            </Button>
          )}
          
          {scannedBarcode && (
            <Button 
              onClick={resetScanner} 
              variant="outline"
              className="border-gray-300"
              disabled={isLoading}
            >
              Scan New Barcode
            </Button>
          )}
        </div>
        
        {/* Development info */}
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>Note: Please connect to Supabase and set up your products database.</p>
          <p className="mt-1">Update the Supabase credentials in src/lib/supabase.ts</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
