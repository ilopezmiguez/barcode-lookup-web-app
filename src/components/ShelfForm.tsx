
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScanBarcode } from 'lucide-react';
import { useShelfOrganizer } from '@/hooks/useShelfOrganizer';

export default function ShelfForm() {
  const { startShelfScan } = useShelfOrganizer();
  const [shelfId, setShelfId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startShelfScan(shelfId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shelf-id">Código de Identificación del Estante</Label>
        <Input
          id="shelf-id"
          placeholder="Ej: A1, ZONA-B3, etc."
          value={shelfId}
          onChange={(e) => setShelfId(e.target.value)}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!shelfId.trim()}
      >
        <ScanBarcode className="mr-2" size={18} />
        Empezar a Escanear para este Estante
      </Button>
    </form>
  );
}
