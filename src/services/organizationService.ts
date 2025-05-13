
import { supabase } from '@/integrations/supabase/client';
import { ScannedProduct } from '@/types/organization';

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
    console.log('Product lookup error:', error);
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
): Promise<{ success: boolean; error?: any }> => {
  try {
    // Prepare data for bulk insert
    const productsToInsert = scannedProducts.map(product => ({
      shelf: currentShelfId,
      barcode_number: product.barcode,
      event_id: currentEventId
    }));
    
    console.log("Saving shelf with products:", productsToInsert);
    
    // Check if the user is authenticated before inserting
    const { data: userData } = await supabase.auth.getSession();
    if (!userData.session) {
      console.error("User is not authenticated");
      return { 
        success: false, 
        error: "Usuario no autenticado. Por favor, inicie sesión para guardar el estante." 
      };
    }
    
    // Bulk insert into org_products table
    const { error } = await supabase
      .from('org_products')
      .insert(productsToInsert);
    
    if (error) {
      console.error('Error saving shelf products:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving shelf:', error);
    return { success: false, error };
  }
};
