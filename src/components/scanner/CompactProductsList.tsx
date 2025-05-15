
import React from 'react';
import { Button } from '@/components/ui/button';
import { Expand } from 'lucide-react';
import { ScannedProduct } from '@/types/organization';

interface CompactProductsListProps {
  isVisible: boolean;
  products: ScannedProduct[];
  onExpand: () => void;
}

const CompactProductsList: React.FC<CompactProductsListProps> = ({
  isVisible,
  products,
  onExpand
}) => {
  if (!isVisible || products.length === 0) return null;
  
  return (
    <div className="fixed top-4 left-4 right-4 z-30 bg-background/80 backdrop-blur-sm rounded-lg shadow-md p-2 border border-border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Último producto: {products[0]?.productName || products[0]?.barcode}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onExpand}
          className="h-7 px-2"
        >
          <Expand size={14} className="mr-1" />
          <span className="text-xs">Expandir</span>
        </Button>
      </div>
    </div>
  );
};

export default CompactProductsList;
