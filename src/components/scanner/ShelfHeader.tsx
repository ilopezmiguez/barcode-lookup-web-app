
import React from 'react';

interface ShelfHeaderProps {
  shelfId: string;
  isReviewing: boolean;
  productCount: number;
}

const ShelfHeader: React.FC<ShelfHeaderProps> = ({
  shelfId,
  isReviewing,
  productCount
}) => {
  const scanningTitle = isReviewing ? "Revisando productos para" : "Escaneando productos para";
  
  return (
    <div className="flex items-center justify-between bg-primary/10 p-3 rounded-md">
      <span className="font-medium">
        {scanningTitle} <span className="font-bold text-primary">{shelfId}</span>
      </span>
      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
        {productCount} productos
      </span>
    </div>
  );
};

export default ShelfHeader;
