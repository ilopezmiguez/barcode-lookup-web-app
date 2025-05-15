
import { useState, useCallback, useEffect } from 'react';
import { OrganizerUIState } from '@/types/organization';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import { scanToast } from '@/hooks/use-toast';

/**
 * Hook to manage the UI state of the manager tools
 */
export function useManagerUIState(uiState: OrganizerUIState) {
  const [isManagerToolsOpen, setIsManagerToolsOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
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
  // and auto-collapse when entering scanning mode
  useEffect(() => {
    if (uiState === 'awaiting_shelf_id' || uiState === 'shelf_saved_options') {
      expandManagerTools();
    } else if (uiState === 'scanning_active') {
      // Always auto-collapse for scanning_active state on both mobile and desktop
      collapseManagerTools();
      
      // Show a toast notification when scanning begins
      scanToast.scanningStarted();
    }
  }, [uiState, expandManagerTools, collapseManagerTools]);

  return {
    isManagerToolsOpen,
    setIsManagerToolsOpen,
    expandManagerTools,
    collapseManagerTools
  };
}
