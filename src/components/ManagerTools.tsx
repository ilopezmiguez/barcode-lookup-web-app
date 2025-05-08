
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';

interface MissingProduct {
  id: string;
  barcode_number: string;
  reported_at: string;
  description?: string;
}

export function ManagerTools() {
  const [isOpen, setIsOpen] = useState(false);
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
      const { data, error } = await supabase
        .from('missing_products')
        .select('id, barcode_number, reported_at, description')
        .order('reported_at', { ascending: false });
      
      if (error) throw error;
      
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
      const response = await supabase.functions.invoke('clear-missing-products', {
        method: 'POST',
      });
      
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
      fetchMissingProducts();
    }
  }, [isOpen]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-center w-full py-2 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Herramientas de Administrador</span>
            {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4">
          <div className="max-h-80 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Lista de Productos Faltantes</h3>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                onClick={copyBarcodesToClipboard} 
                className="flex items-center gap-2"
                disabled={isLoading || !missingProducts.length}
              >
                <Copy size={16} />
                {isCopied ? "¡Copiado!" : "Copiar Lista de Códigos"}
              </Button>
              
              <Button 
                onClick={clearMissingProducts} 
                variant="destructive" 
                className="flex items-center gap-2"
                disabled={isLoading || isClearing || !missingProducts.length}
              >
                <Trash2 size={16} />
                {isClearing ? "Vaciando..." : "Vaciar Lista de Faltantes"}
              </Button>
            </div>
            
            {/* Error state */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando lista...</p>
              </div>
            )}
            
            {/* Empty state */}
            {!isLoading && missingProducts.length === 0 && (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No hay productos faltantes registrados.</p>
              </div>
            )}
            
            {/* Products table */}
            {!isLoading && missingProducts.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código de Barras</TableHead>
                      <TableHead>Fecha Reportado</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {missingProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono">{product.barcode_number || "N/A"}</TableCell>
                        <TableCell>{formatDate(product.reported_at)}</TableCell>
                        <TableCell>{product.description || "Sin descripción"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ManagerTools;
