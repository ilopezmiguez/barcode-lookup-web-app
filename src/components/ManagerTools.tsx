
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

export function ManagerTools() {
  // Use the manager UI state hook
  const { 
    isManagerToolsOpen: isOpen, 
    setIsManagerToolsOpen: setIsOpen,
    expandManagerTools,
    collapseManagerTools,
    uiState,
    isOrganizing,
    scannedProducts
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

  // Add additional height classes when collapsed to prevent overlap
  const collapsedHeightClass = !isOpen && uiState === 'scanning_active' ? 'h-12' : '';

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
              <ShelfOrganizer />
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ManagerTools;
