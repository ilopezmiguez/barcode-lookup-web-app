
import { useState, useCallback, useEffect } from 'react';
import { OrganizerUIState } from '@/types/organization';

/**
 * Hook to manage the UI state of the manager tools
 */
export function useManagerUIState(uiState: OrganizerUIState) {
  const [isManagerToolsOpen, setIsManagerToolsOpen] = useState<boolean>(false);
  
  // Expand manager tools interface
  const expandManagerTools = useCallback(() => {
    console.log("Expanding manager tools");
    setIsManagerToolsOpen(true);
  }, []);
  
  // Collapse manager tools interface
  const collapseManagerTools = useCallback(() => {
    console.log("Collapsing manager tools");
    setIsManagerToolsOpen(false);
  }, []);

  // Auto-expand the manager tools when we need to show the shelf ID input
  useEffect(() => {
    if (uiState === 'awaiting_shelf_id' || uiState === 'shelf_saved_options') {
      expandManagerTools();
    } else if (uiState === 'scanning_active') {
      // Only auto-collapse for scanning_active state on mobile
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        collapseManagerTools();
      }
    }
  }, [uiState, expandManagerTools, collapseManagerTools]);

  return {
    isManagerToolsOpen,
    setIsManagerToolsOpen,
    expandManagerTools,
    collapseManagerTools
  };
}
