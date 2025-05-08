
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportMissingProductProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scannedBarcode?: string | null;
}

const ReportMissingProductDialog: React.FC<ReportMissingProductProps> = ({ 
  open, 
  onOpenChange,
  scannedBarcode
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    barcode_number: scannedBarcode || '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description) {
      toast({
        title: "Descripción requerida",
        description: "Por favor provee una descripción del producto faltante.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('missing_products')
        .insert([formData]);
      
      if (error) throw error;
      
      toast({
        title: "Reporte enviado",
        description: "Gracias por reportar este producto faltante.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error al enviar",
        description: "Hubo un error al enviar tu reporte. Por favor intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reportar Producto Faltante</DialogTitle>
            <DialogDescription>
              Ayúdanos a mejorar nuestra base de datos proporcionando detalles sobre el producto faltante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="barcode_number">Código de Barras (Opcional)</Label>
              <Input
                id="barcode_number"
                name="barcode_number"
                value={formData.barcode_number}
                onChange={handleChange}
                placeholder="Ingresa o edita el código de barras"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Por favor describe el producto (nombre, marca, etc.)"
                rows={4}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportMissingProductDialog;
