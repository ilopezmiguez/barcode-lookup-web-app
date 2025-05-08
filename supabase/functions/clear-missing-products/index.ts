
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get Supabase client with service role key
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    console.log("Clearing missing products table...");
    
    // Delete all records from missing_products table
    const { error } = await supabaseClient
      .from("missing_products")
      .delete()
      .neq("id", "placeholder"); // This deletes all rows
      
    if (error) {
      console.error("Error clearing missing products:", error);
      throw new Error(`Failed to clear missing products: ${error.message}`);
    }
    
    console.log("Missing products table cleared successfully");
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lista de productos faltantes eliminada exitosamente"
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
    
  } catch (error) {
    console.error("Error in clear-missing-products function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido"
      }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

// Start serving
serve(handler);
