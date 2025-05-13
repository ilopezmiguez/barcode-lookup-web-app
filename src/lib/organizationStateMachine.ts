
import { OrganizerUIState } from "@/types/organization";

/**
 * Defines the valid UI state transitions for the organization flow
 */
type StateTransition = {
  [key in OrganizerUIState]: OrganizerUIState[];
};

/**
 * Valid transitions between organization UI states
 */
export const validTransitions: StateTransition = {
  'idle': ['awaiting_shelf_id'],
  'awaiting_shelf_id': ['scanning_active', 'idle'],
  'scanning_active': ['reviewing_shelf', 'shelf_saved_options', 'awaiting_shelf_id'],
  'reviewing_shelf': ['scanning_active', 'shelf_saved_options', 'awaiting_shelf_id'],
  'shelf_saved_options': ['awaiting_shelf_id', 'idle'],
};

/**
 * Check if a transition between two states is valid
 */
export function isValidTransition(from: OrganizerUIState, to: OrganizerUIState): boolean {
  return validTransitions[from]?.includes(to) || false;
}

/**
 * Validates and performs a state transition
 */
export function transition(current: OrganizerUIState, next: OrganizerUIState): OrganizerUIState {
  if (isValidTransition(current, next)) {
    return next;
  }
  
  console.error(`Invalid state transition: ${current} → ${next}`);
  return current; // Stay in current state if transition is invalid
}

/**
 * Get available next states from current state
 */
export function getAvailableNextStates(current: OrganizerUIState): OrganizerUIState[] {
  return validTransitions[current] || [];
}

/**
 * Description of what each state represents
 */
export const stateDescriptions: Record<OrganizerUIState, string> = {
  'idle': 'No organization event is active',
  'awaiting_shelf_id': 'Event started, waiting for shelf ID input',
  'scanning_active': 'Actively scanning products for a shelf',
  'reviewing_shelf': 'Reviewing scanned products',
  'shelf_saved_options': 'Shelf saved, showing options for next steps',
};
