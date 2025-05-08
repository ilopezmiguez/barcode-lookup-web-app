
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MissingProduct {
  id: string;
  barcode_number: string;
  reported_at: string;
  description?: string;
}

interface MissingProductsListProps {
  missingProducts: MissingProduct[];
  isLoading: boolean;
  error: string | null;
}

export function MissingProductsList({ missingProducts, isLoading, error }: MissingProductsListProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };
  
  // Error state
  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
        {error}
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cargando lista...</p>
      </div>
    );
  }
  
  // Empty state
  if (missingProducts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">No hay productos faltantes registrados.</p>
      </div>
    );
  }
  
  console.log('Rendering products list with data:', missingProducts);
  
  // Products table
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código de Barras</TableHead>
            <TableHead>Fecha Reportado</TableHead>
            <TableHead>Descripción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missingProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono">{product.barcode_number || "N/A"}</TableCell>
              <TableCell>{formatDate(product.reported_at)}</TableCell>
              <TableCell>{product.description || "Sin descripción"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
