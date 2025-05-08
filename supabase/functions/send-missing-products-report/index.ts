
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Resend with the API key stored in Supabase secrets
const resend = new Resend(Deno.env.get("RESEND_KEY"));

interface MissingProduct {
  id: string;
  barcode_number: string | null;
  description: string;
  reported_at: string;
}

// Helper function to convert array of objects to CSV
function objectsToCSV(data: MissingProduct[]): string {
  // Extract headers from first object
  const headers = Object.keys(data[0] || {});
  
  // Create CSV header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header as keyof MissingProduct];
      // Handle null values and ensure proper CSV escaping
      if (value === null) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get Supabase client with service role key (needed for DB operations)
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Parse request body to get clearList parameter
    const { clearList } = await req.json();
    
    console.log(`Processing report request. Clear list after: ${clearList}`);
    
    // Fetch all missing products from the database
    const { data: missingProducts, error: fetchError } = await supabaseClient
      .from("missing_products")
      .select("*");
      
    if (fetchError) {
      console.error("Error fetching missing products:", fetchError);
      throw new Error(`Failed to fetch missing products: ${fetchError.message}`);
    }
    
    if (!missingProducts || missingProducts.length === 0) {
      console.log("No missing products found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No missing products found in the database" 
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    console.log(`Found ${missingProducts.length} missing products`);
    
    // Generate CSV from the data
    const csvData = objectsToCSV(missingProducts as MissingProduct[]);
    
    // Create a unique filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const filename = `missing_products_${date}.csv`;
    
    // In Deno, we need to encode string to base64 manually since Buffer is not available
    // This uses the native TextEncoder and btoa functions
    const base64Csv = btoa(csvData);
    
    // Send email with CSV attachment
    const toEmails = ["pablowlopez@gmail.com", "ilopezmiguez.development@gmail.com"];
    const emailResponse = await resend.emails.send({
      from: "Barcode Scanner <onboarding@resend.dev>",
      to: toEmails,
      subject: `Missing Products Report - ${date}`,
      html: `<p>Attached is the list of products scanned but not found in the database as of ${new Date().toLocaleString()}.</p>
             <p>Total missing products: ${missingProducts.length}</p>`,
      attachments: [
        {
          filename,
          content: base64Csv,
          type: "text/csv",
        },
      ],
    });
    
    console.log("Email sent response:", emailResponse);
    
    // Clear the table if requested
    if (clearList) {
      console.log("Clearing missing products table");
      const { error: deleteError } = await supabaseClient
        .from("missing_products")
        .delete()
        .neq("id", "placeholder"); // This deletes all rows
        
      if (deleteError) {
        console.error("Error clearing missing products:", deleteError);
        throw new Error(`Failed to clear missing products: ${deleteError.message}`);
      }
      
      console.log("Missing products table cleared successfully");
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Report sent successfully to ${toEmails.join(", ")}${clearList ? " and list cleared" : ""}` 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
    
  } catch (error) {
    console.error("Error in send-missing-products-report function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
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
