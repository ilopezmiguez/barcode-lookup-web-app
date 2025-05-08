
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from "@/hooks/use-toast";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { MissingProductsList } from '@/components/MissingProductsList';
import { ActionButtons } from '@/components/ActionButtons';
import { useMissingProducts } from '@/hooks/useMissingProducts';

export function ManagerTools() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { 
    missingProducts, 
    isLoading, 
    error, 
    fetchMissingProducts, 
    isCopied, 
    isClearing, 
    copyBarcodesToClipboard, 
    clearMissingProducts 
  } = useMissingProducts(isOpen, toast);

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
            <ActionButtons 
              copyBarcodesToClipboard={copyBarcodesToClipboard}
              clearMissingProducts={clearMissingProducts}
              isLoading={isLoading}
              isClearing={isClearing}
              isCopied={isCopied}
              hasProducts={missingProducts.length > 0}
            />
            
            {/* Products listing */}
            <MissingProductsList 
              missingProducts={missingProducts}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default ManagerTools;
