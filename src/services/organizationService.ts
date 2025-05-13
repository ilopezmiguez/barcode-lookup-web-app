
import { supabase } from '@/integrations/supabase/client';
import { ScannedProduct } from '@/types/organization';

/**
 * Result type for product lookup operations
 */
export interface ProductLookupResult {
  productName: string | null;
  error?: Error | null;
}

/**
 * Result type for shelf save operations
 */
export interface ShelfSaveResult {
  success: boolean;
  error?: any;
  affectedRows?: number;
}

/**
 * Looks up a product name by barcode in the Supabase database
 */
export const lookupProductName = async (barcode: string): Promise<string | null> => {
  try {
    console.log("Looking up product name for barcode:", barcode);
    const { data, error } = await supabase
      .from('products')
      .select('product_name')
      .eq('barcode_number', barcode)
      .maybeSingle();
    
    if (error) {
      console.error('Product lookup error:', error);
      return null;
    }
    
    console.log("Product lookup result:", data);
    return data?.product_name || null;
  } catch (error) {
    console.error('Product lookup error:', error);
    return null;
  }
};

/**
 * Saves a list of scanned products to a shelf in the database
 */
export const saveShelfProducts = async (
  currentEventId: string,
  currentShelfId: string,
  scannedProducts: ScannedProduct[]
): Promise<ShelfSaveResult> => {
  try {
    if (!currentEventId || !currentShelfId) {
      return { 
        success: false, 
        error: "Missing event ID or shelf ID" 
      };
    }
    
    if (!scannedProducts.length) {
      return {
        success: false,
        error: "No products to save"
      };
    }
    
    // Prepare data for bulk insert - ensure we have a unique ID for each product
    // Use timestamp to make entries unique when there are duplicate barcodes
    const productsToInsert = scannedProducts.map((product) => ({
      shelf: currentShelfId,
      barcode_number: product.barcode,
      event_id: currentEventId,
    }));
    
    console.log(`Saving ${productsToInsert.length} products to shelf ${currentShelfId} for event ${currentEventId}`);
    
    // Bulk insert into org_products table
    const { data, error, count } = await supabase
      .from('org_products')
      .insert(productsToInsert)
      .select();
    
    if (error) {
      console.error('Error saving shelf products:', error);
      return { 
        success: false, 
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint
        } 
      };
    }
    
    return { 
      success: true,
      affectedRows: count || productsToInsert.length
    };
  } catch (error) {
    console.error('Error saving shelf:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
