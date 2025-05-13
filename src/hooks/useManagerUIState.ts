
import { useState, useCallback, useEffect } from 'react';
import { OrganizerUIState } from '@/types/organization';

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
    if (uiState === 'awaiting_shelf_id' || uiState === 'shelf_saved_options' || uiState === 'reviewing_shelf') {
      expandManagerTools();
    } else if (uiState === 'scanning_active') {
      collapseManagerTools();
    }
  }, [uiState, expandManagerTools, collapseManagerTools]);

  return {
    isManagerToolsOpen,
    setIsManagerToolsOpen,
    expandManagerTools,
    collapseManagerTools
  };
}
