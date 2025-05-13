
import React, { createContext, useContext, ReactNode } from 'react';
import { useOrganizationState } from '@/hooks/useOrganizationState';
import { useManagerUIState } from '@/hooks/useManagerUIState';
import { ScannedProduct, OrganizerUIState } from '@/types/organization';

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
  
  // Manager tools UI state
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
  
  // Handle transition from scanning_active to reviewing_shelf
  // when manager tools are expanded
  const expandManagerTools = React.useCallback(() => {
    managerUIState.expandManagerTools();
    
    // If we're in scanning_active state and the manager is expanded,
    // transition to reviewing_shelf state
    if (organizationState.uiState === 'scanning_active') {
      console.log("Transitioning from scanning_active to reviewing_shelf");
      // We need to manually trigger this transition as it's a UI-driven state change
      organizationState.uiState = 'reviewing_shelf';
    }
  }, [managerUIState, organizationState]);

  // Prepare the context value by combining our hooks
  const contextValue: OrganizationContextType = {
    ...organizationState,
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
