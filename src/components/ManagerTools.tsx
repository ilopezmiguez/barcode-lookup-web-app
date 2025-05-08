
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Check, Clipboard, List, Loader, Settings, Trash2, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface MissingProduct {
  id: string;
  barcode_number: string | null;
  description: string;
  reported_at: string;
}

const ManagerTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [missingProducts, setMissingProducts] = useState<MissingProduct[]>([]);
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const { toast } = useToast();

  // Fetch missing products when the menu is opened
  useEffect(() => {
    if (isOpen) {
      fetchMissingProducts();
    }
  }, [isOpen]);

  // Function to fetch missing products from Supabase
  const fetchMissingProducts = async () => {
    setLoadingProducts(true);
    setOperationStatus('loading');
    setStatusMessage('Cargando lista de productos faltantes...');
    
    try {
      const { data, error } = await supabase
        .from("missing_products")
        .select("*")
        .order('reported_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setMissingProducts(data || []);
      setOperationStatus('idle');
      setStatusMessage('');
    } catch (err) {
      console.error('Error fetching missing products:', err);
      setOperationStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Error al cargar productos faltantes');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error al cargar productos faltantes',
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Copy barcode list to clipboard
  const copyBarcodeList = async () => {
    if (missingProducts.length === 0) {
      toast({
        title: "Información",
        description: "No hay códigos para copiar",
      });
      return;
    }

    // Create a list of barcode numbers separated by newlines
    const barcodeList = missingProducts
      .map(product => product.barcode_number || "Sin código")
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(barcodeList);
      setCopyStatus('copied');
      toast({
        title: "Éxito",
        description: "Lista de códigos copiada al portapapeles",
      });
      
      // Reset copy status after 3 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive"
      });
    }
  };

  // Clear missing products list
  const clearMissingProducts = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("¿Estás seguro de que quieres borrar todos los productos faltantes?");
    
    if (!confirmed) return;
    
    setOperationStatus('loading');
    setStatusMessage('Eliminando lista de productos faltantes...');
    
    try {
      const { data, error } = await supabase.functions.invoke('clear-missing-products');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        setOperationStatus('success');
        setStatusMessage(data.message || 'Lista vaciada exitosamente');
        toast({
          title: "Éxito",
          description: data.message || 'Lista vaciada exitosamente',
        });
        
        // Refresh the list to show it's empty
        fetchMissingProducts();
      } else {
        setOperationStatus('error');
        setStatusMessage(data.error || 'Error al vaciar la lista');
        toast({
          title: "Error",
          description: data.error || 'Error al vaciar la lista',
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error clearing missing products:', err);
      setOperationStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Error al vaciar la lista');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error al vaciar la lista',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-background border-t border-border shadow-lg"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center p-2 rounded-none border-b border-border"
          >
            <Settings className="h-4 w-4 mr-2" />
            Herramientas de Administrador
            {isOpen ? <X className="h-4 w-4 ml-auto" /> : null}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center">
                  <List className="h-5 w-5 mr-2" />
                  Productos Faltantes
                </h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyBarcodeList}
                    disabled={loadingProducts || missingProducts.length === 0}
                  >
                    {copyStatus === 'copied' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4 mr-1" />
                        Copiar Lista de Códigos
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={clearMissingProducts}
                    disabled={loadingProducts || operationStatus === 'loading' || missingProducts.length === 0}
                  >
                    {operationStatus === 'loading' ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-1" />
                        Vaciando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Vaciar Lista de Faltantes
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {operationStatus !== 'idle' && operationStatus !== 'loading' && (
                <Alert variant={operationStatus === 'error' ? 'destructive' : 'default'}>
                  <AlertDescription className="flex items-center">
                    {operationStatus === 'success' && <Check className="h-4 w-4 mr-2" />}
                    {operationStatus === 'error' && <X className="h-4 w-4 mr-2" />}
                    {statusMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              {loadingProducts ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  <p>Cargando lista...</p>
                </div>
              ) : missingProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay productos faltantes registrados.</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código de Barras</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Fecha Reportado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {missingProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono">
                            {product.barcode_number || "Sin código"}
                          </TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell>{formatDate(product.reported_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ManagerTools;
