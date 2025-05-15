
// First import the toast function from the UI component
import { useToast as useToastOriginal, toast } from "@/components/ui/use-toast";

// Re-export the imports 
export const useToast = useToastOriginal;
export { toast };

// Add convenience method for scanning notifications
export const scanToast = {
  scanningStarted: () => {
    toast({
      title: "Escáner activo",
      description: "Escanee los productos del estante",
      duration: 3000,
    });
  },
  
  productScanned: (barcode: string, isNew: boolean) => {
    toast({
      title: isNew ? "Producto agregado" : "Producto escaneado nuevamente",
      description: `Código: ${barcode}`,
      duration: 2000,
    });
  },
  
  shelfSaved: (shelfId: string, count: number) => {
    toast({
      title: "Estante guardado exitosamente",
      description: `Estante '${shelfId}' guardado con ${count} productos.`,
      duration: 5000,
    });
  },
  
  operationError: (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 5000,
    });
  },
};
