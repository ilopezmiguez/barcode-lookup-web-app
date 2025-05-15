
// Re-export from ui/use-toast directly
export { useToast, toast } from "@/components/ui/use-toast";

// Add convenience method for scanning notifications
export const scanToast = {
  scanning: () => {
    toast({
      title: "Escáner activo",
      description: "Apunte la cámara hacia el código de barras del producto",
    });
  },
  productScanned: (productName?: string) => {
    toast({
      title: "Producto escaneado",
      description: productName || "Producto añadido al estante",
    });
  },
  shelfSaved: () => {
    toast({
      title: "Estante guardado",
      description: "Los productos han sido registrados exitosamente",
    });
  },
  shelfStarted: (shelfId: string) => {
    toast({
      title: "Escaneado iniciado",
      description: `Estante: ${shelfId}. Comience a escanear productos.`,
    });
  }
};
