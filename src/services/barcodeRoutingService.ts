
import { toast } from "@/hooks/use-toast";

/**
 * Types of barcode handling modes
 */
export enum BarcodeHandlingMode {
  PRODUCT_LOOKUP = 'product_lookup',
  SHELF_ORGANIZATION = 'shelf_organization',
}

/**
 * Configuration for the barcode router
 */
export interface BarcodeRouterConfig {
  mode: BarcodeHandlingMode;
  onProductLookup?: (barcode: string) => Promise<void>;
  onShelfOrganization?: (barcode: string) => Promise<void>;
}

/**
 * Service that handles routing barcodes to appropriate handlers
 * based on the current application mode
 */
export class BarcodeRoutingService {
  private config: BarcodeRouterConfig;
  private lastScannedBarcode: string | null = null;
  private scanCooldownMs: number = 1000; // 1 second cooldown (changed from 3000ms)
  private scanTimeoutId: number | null = null;

  constructor(initialConfig: BarcodeRouterConfig) {
    this.config = initialConfig;
    console.log("BarcodeRoutingService initialized with mode:", initialConfig.mode);
  }

  /**
   * Update the router's configuration
   */
  updateConfig(newConfig: Partial<BarcodeRouterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("BarcodeRoutingService configuration updated:", {
      mode: this.config.mode,
      hasProductLookupHandler: !!this.config.onProductLookup,
      hasShelfOrganizationHandler: !!this.config.onShelfOrganization
    });
  }

  /**
   * Handle a barcode scan event
   */
  async handleBarcodeScan(barcode: string): Promise<void> {
    console.log(`BarcodeRoutingService: handling barcode ${barcode} in mode ${this.config.mode}`);
    
    // Validate barcode
    if (!barcode || barcode.trim() === '') {
      console.log("Empty barcode detected, ignoring");
      return;
    }
    
    // Prevent duplicate scans within cooldown period
    if (barcode === this.lastScannedBarcode) {
      console.log("Duplicate barcode scan within cooldown period, ignoring");
      return;
    }
    
    // Set as last scanned and start cooldown
    this.lastScannedBarcode = barcode;
    
    // Clear any existing timeout
    if (this.scanTimeoutId !== null) {
      window.clearTimeout(this.scanTimeoutId);
    }
    
    // Set cooldown timeout
    this.scanTimeoutId = window.setTimeout(() => {
      this.lastScannedBarcode = null;
      console.log("Barcode cooldown reset, ready for new scan");
    }, this.scanCooldownMs);
    
    try {
      // Route to appropriate handler based on mode
      switch (this.config.mode) {
        case BarcodeHandlingMode.PRODUCT_LOOKUP:
          if (this.config.onProductLookup) {
            console.log("Calling product lookup handler");
            await this.config.onProductLookup(barcode);
          } else {
            console.error("No product lookup handler configured");
            toast({
              title: "Error de configuración",
              description: "No hay un manejador configurado para búsqueda de productos",
              variant: "destructive"
            });
          }
          break;
        
        case BarcodeHandlingMode.SHELF_ORGANIZATION:
          if (this.config.onShelfOrganization) {
            console.log("Calling shelf organization handler");
            await this.config.onShelfOrganization(barcode);
          } else {
            console.error("No shelf organization handler configured");
            toast({
              title: "Error de configuración",
              description: "No hay un manejador configurado para organización de estantes",
              variant: "destructive"
            });
          }
          break;
          
        default:
          console.error("Unknown barcode handling mode");
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error);
      toast({
        title: "Error al procesar código",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    }
  }
  
  /**
   * Reset the service state
   */
  reset(): void {
    console.log("Resetting barcode router state");
    this.lastScannedBarcode = null;
    if (this.scanTimeoutId !== null) {
      window.clearTimeout(this.scanTimeoutId);
      this.scanTimeoutId = null;
    }
  }
}

// Singleton instance for the application
export const barcodeRouter = new BarcodeRoutingService({
  mode: BarcodeHandlingMode.PRODUCT_LOOKUP
});
