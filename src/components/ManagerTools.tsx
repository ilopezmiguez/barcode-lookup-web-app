
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MissingProductsList } from '@/components/MissingProductsList';
import { ActionButtons } from '@/components/ActionButtons';
import { useMissingProducts } from '@/hooks/useMissingProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShelfOrganizer } from '@/components/ShelfOrganizer';
import { useOrganization } from '@/contexts/OrganizationContext';

export function ManagerTools() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the organization context
  const { 
    uiState, 
    expandManagerTools, 
    collapseManagerTools
  } = useOrganization();
  
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
  
  // Sync the collapsible state with the organization context
  useEffect(() => {
    if (isOpen) {
      expandManagerTools();
    } else {
      collapseManagerTools();
    }
  }, [isOpen, expandManagerTools, collapseManagerTools]);
  
  // Auto-expand the manager tools when we need to show the shelf ID input
  useEffect(() => {
    if (uiState === 'awaiting_shelf_id' || uiState === 'shelf_saved_options') {
      setIsOpen(true);
    }
  }, [uiState]);

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
          <Tabs defaultValue="missing-products" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="missing-products" className="flex-1">
                Productos Faltantes
              </TabsTrigger>
              <TabsTrigger value="shelf-organization" className="flex-1">
                Organización de Estantes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="missing-products" className="max-h-80 overflow-y-auto">
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
            
            <TabsContent value="shelf-organization" className="max-h-[calc(80vh-7rem)]">
              <ShelfOrganizer />
            </TabsContent>
          </Tabs>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ManagerTools;
