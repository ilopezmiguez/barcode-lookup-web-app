
import React, { useState, useEffect } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronUp, ChevronDown, PanelLeftClose } from 'lucide-react';
import { MissingProductsList } from '@/components/MissingProductsList';
import { ActionButtons } from '@/components/ActionButtons';
import { useMissingProducts } from '@/hooks/useMissingProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShelfOrganizer } from '@/components/ShelfOrganizer';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CircleCheck, PackageSearch, Expand, Minimize } from 'lucide-react';

export function ManagerTools() {
  // Use the manager UI state hook
  const { 
    isManagerToolsOpen: isOpen, 
    setIsManagerToolsOpen: setIsOpen,
    expandManagerTools,
    collapseManagerTools,
    uiState,
    isOrganizing,
    scannedProducts,
    toggleScanningMode
  } = useOrganization();
  
  const isMobile = useIsMobile();
  
  // Pass only the isOpen state to the hook - toast will be obtained inside the hook
  const { 
    missingProducts, 
    isLoading: missingProductsLoading, 
    error, 
    fetchMissingProducts, 
    isCopied, 
    isClearing, 
    copyBarcodesToClipboard, 
    clearMissingProducts 
  } = useMissingProducts(isOpen);
  
  // Current active tab
  const [activeTab, setActiveTab] = useState('missing-products');

  // Set appropriate tab based on organization state
  useEffect(() => {
    if (isOrganizing) {
      setActiveTab('shelf-organization');
    }
  }, [isOrganizing]);

  // Determine if we're in review mode
  const isReviewing = uiState === 'reviewing_shelf';

  // Add additional height classes when collapsed to prevent overlap
  const collapsedHeightClass = !isOpen && uiState === 'scanning_active' ? 'h-12' : '';

  // Scanned Products List Component - Only shown in the manager tools when in organization mode
  const ScannedProductsList = () => {
    if (scannedProducts.length === 0) {
      return (
        <p className="text-muted-foreground text-center py-2">
          No hay productos escaneados aún
        </p>
      );
    }
    
    return (
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
    );
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-md transition-all duration-300 ${collapsedHeightClass} ${isOpen ? '' : 'pb-0'}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger className="flex items-center justify-center w-full py-2 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            {isOrganizing && !isOpen && scannedProducts.length > 0 && (
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                {scannedProducts.length}
              </span>
            )}
            <span className="font-semibold">Herramientas de Administrador</span>
            {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Floating close button - visible on mobile when scanning */}
          {uiState === 'scanning_active' && isMobile && (
            <div className="md:hidden fixed top-4 right-4 z-50">
              <Button 
                size="sm" 
                variant="outline"
                className="rounded-full h-10 w-10 p-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              >
                <PanelLeftClose size={16} />
              </Button>
            </div>
          )}
          
          <Tabs 
            defaultValue="missing-products" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full mb-4">
              <TabsTrigger value="missing-products" className="flex-1">
                Productos Faltantes
              </TabsTrigger>
              <TabsTrigger value="shelf-organization" className="flex-1">
                Organización de Estantes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="missing-products">
              <h3 className="text-lg font-semibold mb-4">Lista de Productos Faltantes</h3>
              
              {/* Actions */}
              <ActionButtons 
                copyBarcodesToClipboard={copyBarcodesToClipboard}
                clearMissingProducts={clearMissingProducts}
                isLoading={missingProductsLoading}
                isClearing={isClearing}
                isCopied={isCopied}
                hasProducts={missingProducts.length > 0}
              />
              
              {/* Products listing */}
              <MissingProductsList 
                missingProducts={missingProducts}
                isLoading={missingProductsLoading}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="shelf-organization" className="max-h-[55vh] overflow-y-auto">
              {/* Show ShelfOrganizer for form inputs and options */}
              <ShelfOrganizer />
              
              {/* Only show product list when in scanning or review mode */}
              {(uiState === 'scanning_active' || uiState === 'reviewing_shelf') && (
                <Card className="mb-4 mt-4">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Productos escaneados ({scannedProducts.length})</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleScanningMode(uiState !== 'reviewing_shelf')}
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
                    
                    <ScannedProductsList />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ManagerTools;
