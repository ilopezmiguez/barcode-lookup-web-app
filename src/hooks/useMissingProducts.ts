
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MissingProduct {
  id: string;
  barcode_number: string;
  reported_at: string;
  description?: string;
}

export function useMissingProducts(isOpen: boolean, toast: any) {
  const [missingProducts, setMissingProducts] = useState<MissingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch missing products
  const fetchMissingProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching missing products...');
      
      const { data, error } = await supabase
        .from('missing_products')
        .select('barcode_number, description, reported_at, id');
      
      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }
      
      console.log('Fetched data:', data);
      setMissingProducts(data || []);
    } catch (err) {
      console.error('Error fetching missing products:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar productos faltantes');
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos faltantes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy barcodes to clipboard
  const copyBarcodesToClipboard = () => {
    const barcodeList = missingProducts
      .map(product => product.barcode_number)
      .filter(Boolean)
      .join('\n');
    
    if (!barcodeList) {
      toast({
        title: "Información",
        description: "No hay códigos de barras para copiar",
      });
      return;
    }
    
    navigator.clipboard.writeText(barcodeList)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "¡Éxito!",
          description: "Lista de códigos copiada al portapapeles",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive"
        });
      });
  };
  
  // Clear missing products
  const clearMissingProducts = async () => {
    if (!missingProducts.length) {
      toast({
        title: "Información",
        description: "La lista ya está vacía",
      });
      return;
    }
    
    // Show confirmation dialog
    const isConfirmed = window.confirm("¿Estás seguro de que quieres borrar todos los productos faltantes?");
    if (!isConfirmed) return;
    
    setIsClearing(true);
    
    try {
      console.log('Invoking clear-missing-products function...');
      const response = await supabase.functions.invoke('clear-missing-products', {
        method: 'POST',
      });
      
      console.log('Clear function response:', response);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al vaciar la lista');
      }
      
      toast({
        title: "¡Éxito!",
        description: "Lista de productos faltantes vaciada",
      });
      
      // Refresh the list
      fetchMissingProducts();
    } catch (err) {
      console.error('Error clearing missing products:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo vaciar la lista de productos faltantes",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };
  
  // Fetch data when the collapsible is opened
  useEffect(() => {
    if (isOpen) {
      console.log('ManagerTools opened, fetching data...');
      fetchMissingProducts();
    }
  }, [isOpen]);
  
  return {
    missingProducts,
    isLoading,
    error,
    fetchMissingProducts,
    isCopied,
    isClearing,
    copyBarcodesToClipboard,
    clearMissingProducts
  };
}
