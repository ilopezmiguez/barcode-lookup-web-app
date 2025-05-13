
import React from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { PackageOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrganizationStatusIndicator() {
  const { 
    isOrganizing, 
    uiState, 
    currentEventId, 
    currentShelfId, 
    scannedProducts,
    expandManagerTools
  } = useOrganization();

  // Only show the indicator when we're in scanning_active mode
  if (!isOrganizing || uiState !== 'scanning_active') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground py-2 px-4 z-50 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <PackageOpen size={18} />
        <span>
          <strong>Organizando Estante:</strong> {currentShelfId} | 
          <strong> Evento:</strong> {currentEventId} | 
          <strong> Escaneados:</strong> {scannedProducts.length}
        </span>
      </div>
      
      <Button 
        size="sm" 
        variant="ghost" 
        className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
        onClick={expandManagerTools}
      >
        <span className="mr-1">Revisar</span>
        <X size={16} />
      </Button>
    </div>
  );
}

export default OrganizationStatusIndicator;
