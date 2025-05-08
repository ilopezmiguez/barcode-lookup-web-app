
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    console.log("Deleting all records from missing_products table");
    
    // Delete all records from the missing_products table
    const { error } = await supabaseClient
      .from("missing_products")
      .delete()
      .neq("id", "impossible-id"); // Using a condition to delete all rows
    
    if (error) {
      console.error("Error deleting records:", error);
      throw error;
    }

    console.log("Successfully deleted all records from missing_products table");
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Function execution error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unknown error occurred" 
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        },
        status: 400 
      }
    );
  }
});
