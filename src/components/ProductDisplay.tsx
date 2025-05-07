
import React, { useState, useEffect } from 'react';
import { Check, Search, X, Package, ArrowRight, Tag, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';

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
  onHistoryItemClick?: (product: Product) => void;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ 
  product, 
  isLoading, 
  error,
  scannedBarcode,
  onHistoryItemClick
}) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isRelatedOpen, setIsRelatedOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState<Product[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load scan history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('scanHistory');
    if (storedHistory) {
      setScanHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Fetch related products when a product with a category is displayed
  useEffect(() => {
    if (product && product.category) {
      fetchRelatedProducts(product.category, product.barcode_number);
    } else {
      setRelatedProducts([]);
    }
  }, [product]);

  // Update scan history when a new product is successfully scanned
  useEffect(() => {
    if (product) {
      // Add current product to history if it's not already the most recent
      const updatedHistory = [product];
      
      // Add previous history items, excluding any duplicates of current product
      scanHistory.forEach(historyItem => {
        if (historyItem.barcode_number !== product.barcode_number && updatedHistory.length < 5) {
          updatedHistory.push(historyItem);
        }
      });
      
      // Update state and localStorage
      setScanHistory(updatedHistory);
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
    }
  }, [product]);

  const fetchRelatedProducts = async (category: string, currentBarcode: string) => {
    setIsLoadingRelated(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('product_name, price, barcode_number, category')
        .eq('category', category)
        .neq('barcode_number', currentBarcode)
        .limit(5);
      
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
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-5 w-5 rounded-full bg-blue-500 animate-pulse"></div>
          <p className="text-gray-600">Retrieving product information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-lg border border-red-200 bg-red-50 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <X className="h-6 w-6 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            {scannedBarcode && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Scanned barcode: {scannedBarcode}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!product && !scannedBarcode) {
    return (
      <div className="w-full max-w-md mx-auto mt-6">
        {/* Ready to scan message */}
        <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm mb-4">
          <div className="flex flex-col items-center justify-center text-center">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Ready to Scan</h3>
            <p className="mt-1 text-sm text-gray-500">
              Position a barcode within the scanner area to view product information.
            </p>
          </div>
        </div>

        {/* Scan History Section */}
        {scanHistory.length > 0 && (
          <div className="mt-6">
            <Collapsible 
              open={isHistoryOpen}
              onOpenChange={setIsHistoryOpen}
              className="border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <History className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-md font-medium">Recent Scans</h3>
                </div>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2"
                  >
                    {isHistoryOpen ? 'Hide' : 'Show'}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {scanHistory.map((historyItem, index) => (
                      <li 
                        key={`${historyItem.barcode_number}-${index}`} 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onHistoryItemClick && onHistoryItemClick(historyItem)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{historyItem.product_name}</span>
                          <span className="text-sm font-semibold text-green-600">${historyItem.price.toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    );
  }

  if (!product && scannedBarcode) {
    return (
      <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-lg border border-yellow-200 bg-yellow-50 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <X className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">Product Not Found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>No product matches the scanned barcode in our database.</p>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Scanned barcode: {scannedBarcode}</p>
            </div>
          </div>
        </div>
        
        {/* Scan History for Not Found Cases */}
        {scanHistory.length > 0 && (
          <div className="mt-6">
            <Collapsible 
              open={isHistoryOpen}
              onOpenChange={setIsHistoryOpen}
              className="border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <History className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-md font-medium">Recent Scans</h3>
                </div>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2"
                  >
                    {isHistoryOpen ? 'Hide' : 'Show'}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {scanHistory.map((historyItem, index) => (
                      <li 
                        key={`${historyItem.barcode_number}-${index}`} 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onHistoryItemClick && onHistoryItemClick(historyItem)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{historyItem.product_name}</span>
                          <span className="text-sm font-semibold text-green-600">${historyItem.price.toFixed(2)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      {/* Product Details Card */}
      <div className="p-6 rounded-lg border border-green-200 bg-white shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Check className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900">Product Found</h3>
            
            <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">{product?.product_name}</dd>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-600">
                      ${product?.price.toFixed(2)}
                    </dd>
                  </div>
                  
                  {product?.category && (
                    <div className="border-t border-gray-200 pt-4">
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd className="mt-1 flex items-center">
                        <Tag className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm font-medium text-gray-700">{product.category}</span>
                      </dd>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <dt className="text-sm font-medium text-gray-500">Barcode</dt>
                    <dd className="mt-1 text-sm font-mono text-gray-700">{product?.barcode_number}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {product?.category && (
        <div className="mt-4">
          <Collapsible 
            open={isRelatedOpen}
            onOpenChange={setIsRelatedOpen}
            className="border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-md font-medium">Ver productos relacionados</span>
                </div>
                {isRelatedOpen ? 'Ocultar' : 'Mostrar'}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="border-t border-gray-200 p-4">
                {isLoadingRelated ? (
                  <div className="flex justify-center py-4">
                    <div className="h-5 w-5 rounded-full bg-blue-500 animate-pulse"></div>
                  </div>
                ) : relatedProducts.length > 0 ? (
                  <>
                    <ul className="divide-y divide-gray-200">
                      {relatedProducts.map((relatedProduct) => (
                        <li key={relatedProduct.barcode_number} className="py-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{relatedProduct.product_name}</span>
                            <span className="text-sm font-semibold text-green-600">${relatedProduct.price.toFixed(2)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 flex justify-center">
                      <Button 
                        variant="ghost" 
                        className="text-blue-600 flex items-center"
                        onClick={() => {/* This would navigate to a full category view */}}
                      >
                        Ver todos en esta categoría
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-center py-3 text-gray-500">
                    No hay productos relacionados en esta categoría.
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      {/* Scan History Section */}
      {scanHistory.length > 0 && (
        <div className="mt-4">
          <Collapsible 
            open={isHistoryOpen}
            onOpenChange={setIsHistoryOpen}
            className="border border-gray-200 rounded-lg bg-white shadow-sm"
          >
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <History className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-md font-medium">Recent Scans</h3>
              </div>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2"
                >
                  {isHistoryOpen ? 'Hide' : 'Show'}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {scanHistory.map((historyItem, index) => (
                    <li 
                      key={`${historyItem.barcode_number}-${index}`} 
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => onHistoryItemClick && onHistoryItemClick(historyItem)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">{historyItem.product_name}</span>
                        <span className="text-sm font-semibold text-green-600">${historyItem.price.toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
};

export default ProductDisplay;
