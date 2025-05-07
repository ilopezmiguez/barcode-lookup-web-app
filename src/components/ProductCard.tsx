
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: number;
  barcode?: string;
  category?: string | null;
  onClick?: () => void;
  className?: string;
  actions?: React.ReactNode;
  isHighlighted?: boolean;
}

export default function ProductCard({
  name,
  price,
  barcode,
  category,
  onClick,
  className,
  actions,
  isHighlighted = false
}: ProductCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md", 
        isHighlighted && "border-primary",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold leading-tight">{name}</CardTitle>
        {category && (
          <CardDescription className="text-sm">
            Category: {category}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex justify-between items-center">
          <p className="text-xl font-semibold text-primary">
            ${price.toFixed(2)}
          </p>
          {barcode && (
            <span className="text-sm text-muted-foreground">
              {barcode}
            </span>
          )}
        </div>
      </CardContent>
      {actions && (
        <CardFooter className="pt-0 flex justify-end">
          {actions}
        </CardFooter>
      )}
    </Card>
  );
}
