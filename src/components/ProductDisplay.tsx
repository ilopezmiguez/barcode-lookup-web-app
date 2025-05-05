
import React from 'react';
import { Check, Search, X } from 'lucide-react';

interface Product {
  product_name: string;
  price: number;
  barcode_number: string;
}

interface ProductDisplayProps {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  scannedBarcode: string | null;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ 
  product, 
  isLoading, 
  error,
  scannedBarcode
}) => {
  
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
      <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <Search className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Ready to Scan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Position a barcode within the scanner area to view product information.
          </p>
        </div>
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
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6 p-6 rounded-lg border border-green-200 bg-white shadow-sm">
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
  );
};

export default ProductDisplay;
