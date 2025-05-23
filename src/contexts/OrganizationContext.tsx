
import React, { createContext, useContext, ReactNode } from 'react';
import { useOrganizationState } from '@/hooks/useOrganizationState';
import { useManagerUIState } from '@/hooks/useManagerUIState';
import { ScannedProduct, OrganizerUIState } from '@/types/organization';
import { BarcodeHandlingMode } from '@/services/barcodeRoutingService';
import { useBarcodeRouter } from '@/hooks/useBarcodeRouter';
import { toast } from '@/hooks/use-toast';

// Define the shape of our context
interface OrganizationContextType {
  // Event state
  isOrganizing: boolean;
  currentEventId: string | null;
  currentShelfId: string;
  scannedProducts: ScannedProduct[];
  uiState: OrganizerUIState;
  isLoading: boolean;
  
  // Actions
  startOrganizationEvent: () => void;
  startShelfScan: (shelfId: string) => void;
  handleProductScan: (barcode: string) => Promise<void>;
  saveShelf: () => Promise<void>;
  startNewShelf: () => void;
  cancelCurrentShelf: () => void;
  endOrganizationEvent: () => void;
  toggleScanningMode: (isReviewing: boolean) => void;
  
  // Manager tools UI state
  isManagerToolsOpen: boolean;
  setIsManagerToolsOpen: (isOpen: boolean) => void;
  collapseManagerTools: () => void;
  expandManagerTools: () => void;
}

// Create the context with a default undefined value
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Create a provider component
export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use our organization state hook
  const organizationState = useOrganizationState();
  
  // Use the manager UI state hook
  const managerUIState = useManagerUIState(organizationState.uiState);
  
  // Enhanced toggleScanningMode that coordinates with manager tools
  const enhancedToggleScanningMode = React.useCallback((isReviewing: boolean) => {
    console.log(`enhancedToggleScanningMode called with isReviewing=${isReviewing}`);
    
    // Toggle the scanning/reviewing state
    organizationState.toggleScanningMode(isReviewing);
    
    // When returning to scanning mode, collapse the manager tools and show a toast
    if (!isReviewing) {
      console.log("Collapsing manager tools when returning to scanning mode");
      managerUIState.collapseManagerTools();
      
      toast({
        title: "Modo de escaneo activado",
        description: "Escanee productos para añadirlos al estante"
      });
    }
  }, [organizationState.toggleScanningMode, managerUIState.collapseManagerTools]);
  
  // Handle transition from scanning_active to reviewing_shelf when manager tools are expanded
  const expandManagerTools = React.useCallback(() => {
    managerUIState.expandManagerTools();
    
    // If we're in scanning_active state and the manager is expanded,
    // transition to reviewing_shelf state
    if (organizationState.uiState === 'scanning_active') {
      console.log("Transitioning from scanning_active to reviewing_shelf");
      organizationState.toggleScanningMode(true);
    }
  }, [managerUIState, organizationState.uiState, organizationState.toggleScanningMode]);

  // Configure barcode router using our new hook
  useBarcodeRouter({
    mode: organizationState.isOrganizing && 
         (organizationState.uiState === 'scanning_active' || organizationState.uiState === 'reviewing_shelf')
         ? BarcodeHandlingMode.SHELF_ORGANIZATION
         : BarcodeHandlingMode.PRODUCT_LOOKUP,
    onShelfOrganization: organizationState.handleProductScan,
    enabled: true
  });

  // Prepare the context value by combining our hooks
  const contextValue: OrganizationContextType = {
    ...organizationState,
    toggleScanningMode: enhancedToggleScanningMode, // Use the enhanced version
    isManagerToolsOpen: managerUIState.isManagerToolsOpen,
    setIsManagerToolsOpen: managerUIState.setIsManagerToolsOpen,
    collapseManagerTools: managerUIState.collapseManagerTools,
    expandManagerTools,
  };

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Create a custom hook to use the context
export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export type { ScannedProduct, OrganizerUIState };
