
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

interface FloatingExpandButtonProps {
  isVisible: boolean;
  productCount: number;
  onClick: () => void;
}

const FloatingExpandButton: React.FC<FloatingExpandButtonProps> = ({
  isVisible,
  productCount,
  onClick
}) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Button
        size="sm"
        variant="secondary"
        className="h-10 shadow-md rounded-full flex items-center gap-1"
        onClick={onClick}
      >
        <ChevronUp size={15} />
        <span className="font-medium">Ver Lista ({productCount})</span>
      </Button>
    </div>
  );
};

export default FloatingExpandButton;
