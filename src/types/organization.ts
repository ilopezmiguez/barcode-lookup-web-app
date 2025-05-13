
/**
 * Represents a scanned product during organization
 */
export interface ScannedProduct {
  barcode: string;
  timestamp: Date;
  productName?: string | null;
}

/**
 * Possible UI states for the organization flow
 */
export type OrganizerUIState = 
  | 'idle'                // No organization event is active
  | 'awaiting_shelf_id'   // Event started, waiting for shelf ID input
  | 'scanning_active'     // Actively scanning products for a shelf
  | 'reviewing_shelf'     // Reviewing scanned products (after expanding during scanning)
  | 'shelf_saved_options'; // After saving a shelf, showing options for next steps

/**
 * Organization feature state
 */
export interface OrganizationState {
  isOrganizing: boolean;
  currentEventId: string | null;
  currentShelfId: string;
  scannedProducts: ScannedProduct[];
  uiState: OrganizerUIState;
  isLoading: boolean;
}
