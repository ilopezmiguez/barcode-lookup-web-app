
import { createClient } from '@supabase/supabase-js';

// Replace these values with your actual Supabase project details
// These will be publicly visible, but that's OK since we'll use Row Level Security (RLS)
// in the Supabase dashboard to control access
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
SUPABASE SETUP INSTRUCTIONS:

1. Create a 'products' table in Supabase with the following columns:
   - id (uuid, primary key, default: uuid_generate_v4())
   - barcode_number (text, not null, unique)
   - product_name (text, not null)
   - price (numeric, not null)

2. Enable Row Level Security (RLS) and add a policy to allow public reading:
   - Policy name: "Allow public read access"
   - Operation: SELECT
   - Target roles: authenticated, anon
   - Using expression: true

3. Populate with test data:
   INSERT INTO products (barcode_number, product_name, price) VALUES
   ('7790123456789012', 'Leche Entera Larga Vida 1L', 1450.50),
   ('7799876543210987', 'Yerba Mate Suave 1kg', 4850.00),
   ('7791111222233334', 'Galletitas de Agua Clásicas 500g', 1120.75),
   ('7795555666677778', 'Aceite de Girasol Alto Oleico 1.5L', 3990.00),
   ('7791212121234345', 'Fideos Tirabuzón 500g', 1080.25),
   ('7799000888877776', 'Queso Cremoso Punta del Agua (kg)', 11500.00),
   ('7793636363645450', 'Pollo Entero Fresco (kg)', 5350.00),
   ('7797777888899991', 'Lavandina Ayudín Clásica 2L', 1980.90),
   ('7794141414158582', 'Pan de Molde Integral Grande', 2350.00),
   ('7796565656521213', 'Café Instantáneo Fuerte 170g', 7200.50);
*/
