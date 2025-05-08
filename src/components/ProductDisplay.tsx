import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ProductCard from './ProductCard';
import ReportMissingProductDialog from './ReportMissingProductDialog';
import { ChevronDown, ChevronUp, Clock, Tag, AlertTriangle } from 'lucide-react';
interface Product {
  product_name: string;
  price: number;
  barcode_number: string;
  category?: string | null;
}
interface ProductDisplayProps {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  scannedBarcode: string | null;
  onHistoryItemClick: (product: Product) => void;
}
const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  isLoading,
  error,
  scannedBarcode,
  onHistoryItemClick
}) => {
  const [scanHistory, setScanHistory] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isRelatedOpen, setIsRelatedOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Load scan history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('scanHistory');
    if (storedHistory) {
      setScanHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Update scan history when a new product is found
  useEffect(() => {
    if (product) {
      // Check if product already exists in history
      const exists = scanHistory.some(item => item.barcode_number === product.barcode_number);
      if (!exists) {
        // Add to beginning of array, keep only 5 most recent
        const updatedHistory = [product, ...scanHistory].slice(0, 5);
        setScanHistory(updatedHistory);
        // Store in localStorage
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      }

      // Load related products if the scanned product has a category
      if (product.category) {
        fetchRelatedProducts(product.category, product.barcode_number);
      } else {
        setRelatedProducts([]);
      }
    }
  }, [product]);
  const fetchRelatedProducts = async (category: string, currentBarcode: string) => {
    setIsLoadingRelated(true);
    try {
      const {
        data,
        error
      } = await supabase.from('products').select('product_name, price, barcode_number, category').eq('category', category).neq('barcode_number', currentBarcode).limit(10);
      if (error) {
        console.error('Error fetching related products:', error);
      } else {
        setRelatedProducts(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch related products:', err);
    } finally {
      setIsLoadingRelated(false);
    }
  };
  if (isLoading) {
    return <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2 mb-3" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      </div>;
  }
  if (error) {
    return <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>;
  }
  if (!product && scannedBarcode) {
    return <>
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-muted-foreground flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
              No Product Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">No product found with barcode: {scannedBarcode}</p>
            <Button variant="secondary" onClick={() => setIsReportDialogOpen(true)} className="w-full">
              Report Missing Product
            </Button>
          </CardContent>
        </Card>
        
        <ReportMissingProductDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen} scannedBarcode={scannedBarcode} />
      </>;
  }
  if (!product) {
    return <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-muted-foreground">Listo para escanear</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Position a barcode in the scanner area to get product information.</p>
        </CardContent>
      </Card>;
  }

  // Display product information
  return <div className="space-y-6">
      {/* Current Product */}
      <ProductCard name={product.product_name} price={product.price} barcode={product.barcode_number} category={product.category} isHighlighted={true} />
      
      {/* Related Products */}
      {product.category && relatedProducts.length > 0 && <Collapsible open={isRelatedOpen} onOpenChange={setIsRelatedOpen} className="border border-border rounded-md overflow-hidden">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center p-4 rounded-none">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <span>Related Products ({relatedProducts.length})</span>
              </div>
              {isRelatedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4 bg-muted/10">
            <div className="grid gap-3">
              {isLoadingRelated ? <div className="space-y-2">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div> : <>
                  {(showAllRelated ? relatedProducts : relatedProducts.slice(0, 5)).map(relatedProduct => <ProductCard key={relatedProduct.barcode_number} name={relatedProduct.product_name} price={relatedProduct.price} onClick={() => onHistoryItemClick(relatedProduct)} />)}
                  
                  {relatedProducts.length > 5 && <Button variant="outline" className="mt-2" onClick={() => setShowAllRelated(!showAllRelated)}>
                      {showAllRelated ? "Show Less" : "Ver todos en esta categoría"}
                    </Button>}
                </>}
            </div>
          </CollapsibleContent>
        </Collapsible>}
      
      {/* Scan History */}
      {scanHistory.length > 0 && <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen} className="border border-border rounded-md overflow-hidden">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center p-4 rounded-none">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Scan History ({scanHistory.length})</span>
              </div>
              {isHistoryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4 bg-muted/10">
            <div className="grid gap-3">
              {scanHistory.map((historyItem, index) => <ProductCard key={`${historyItem.barcode_number}-${index}`} name={historyItem.product_name} price={historyItem.price} onClick={() => onHistoryItemClick(historyItem)} isHighlighted={historyItem.barcode_number === product.barcode_number} />)}
            </div>
          </CollapsibleContent>
        </Collapsible>}
    </div>;
};
export default ProductDisplay;