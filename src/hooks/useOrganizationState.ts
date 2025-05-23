
import { useOrganizationCore } from '@/hooks/useOrganizationCore';
import { useOrganizationOperations } from '@/hooks/useOrganizationOperations';
import { useOrganizationUI } from '@/hooks/useOrganizationUI';
import { useManagerUIState } from '@/hooks/useManagerUIState';

/**
 * Main hook that combines organization core state, operations, and UI management
 */
export function useOrganizationState() {
  // Set up core organization state and actions
  const core = useOrganizationCore();
  
  // Set up complex operations
  const operations = useOrganizationOperations(
    core.currentEventId,
    core.currentShelfId,
    core.scannedProducts,
    core.isProductAlreadyScanned,
    core.addScannedProduct,
    core.updateScannedProduct,
    core.changeUiState
  );
  
  // Set up UI specific actions
  const ui = useOrganizationUI(
    core.scannedProducts,
    core.changeUiState,
    core.resetOrganizationEvent,
    core.setCurrentShelfId
  );
  
  // Set up manager UI state
  const managerUI = useManagerUIState(core.uiState);

  // Log state changes for debugging
  console.log("Organization state:", {
    isOrganizing: core.isOrganizing,
    currentEventId: core.currentEventId,
    currentShelfId: core.currentShelfId,
    uiState: core.uiState,
    isManagerToolsOpen: managerUI.isManagerToolsOpen,
    productCount: core.scannedProducts.length
  });

  return {
    // State
    isOrganizing: core.isOrganizing,
    currentEventId: core.currentEventId,
    currentShelfId: core.currentShelfId,
    scannedProducts: core.scannedProducts,
    uiState: core.uiState,
    isLoading: operations.isLoading,
    isManagerToolsOpen: managerUI.isManagerToolsOpen,
    
    // Actions
    startOrganizationEvent: core.startOrganizationEvent,
    startShelfScan: core.startShelfScan,
    handleProductScan: operations.handleProductScan,
    saveShelf: operations.saveShelf,
    startNewShelf: ui.startNewShelf,
    cancelCurrentShelf: ui.cancelCurrentShelf,
    endOrganizationEvent: ui.endOrganizationEvent,
    toggleScanningMode: ui.toggleScanningMode,
    setIsManagerToolsOpen: managerUI.setIsManagerToolsOpen,
    expandManagerTools: managerUI.expandManagerTools,
    collapseManagerTools: managerUI.collapseManagerTools
  };
}
