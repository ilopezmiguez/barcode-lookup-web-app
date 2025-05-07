
export function ColorPalette() {
  return (
    <div className="flex flex-col gap-6">
      <h2>Color Palette</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <div className="h-24 bg-design-white border border-gray-200 rounded-t-md"></div>
          <div className="bg-gray-100 p-2 rounded-b-md border border-t-0 border-gray-200">
            <p className="font-semibold">White</p>
            <p className="text-xs font-mono">#FFFFFF</p>
            <p className="text-xs">Background</p>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="h-24 bg-design-typography rounded-t-md"></div>
          <div className="bg-gray-100 p-2 rounded-b-md border border-t-0 border-gray-200">
            <p className="font-semibold">Typography</p>
            <p className="text-xs font-mono">#68B0AB</p>
            <p className="text-xs">Text & Primary</p>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="h-24 bg-design-accent rounded-t-md"></div>
          <div className="bg-gray-100 p-2 rounded-b-md border border-t-0 border-gray-200">
            <p className="font-semibold">Accent</p>
            <p className="text-xs font-mono">#C8D5B9</p>
            <p className="text-xs">Secondary & Accents</p>
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="h-24 bg-design-detail rounded-t-md"></div>
          <div className="bg-gray-100 p-2 rounded-b-md border border-t-0 border-gray-200">
            <p className="font-semibold">Detail</p>
            <p className="text-xs font-mono">#4A7C59</p>
            <p className="text-xs">Tables & Details</p>
          </div>
        </div>
      </div>

      <h3>Theme Colors</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ColorSwatch name="Background" className="bg-background" borderClass="border" />
        <ColorSwatch name="Foreground" className="bg-foreground" />
        <ColorSwatch name="Primary" className="bg-primary" />
        <ColorSwatch name="Primary Foreground" className="bg-primary-foreground border" />
        <ColorSwatch name="Secondary" className="bg-secondary" />
        <ColorSwatch name="Secondary Foreground" className="bg-secondary-foreground" />
        <ColorSwatch name="Accent" className="bg-accent" />
        <ColorSwatch name="Accent Foreground" className="bg-accent-foreground" />
        <ColorSwatch name="Muted" className="bg-muted" borderClass="border" />
        <ColorSwatch name="Muted Foreground" className="bg-muted-foreground" />
        <ColorSwatch name="Destructive" className="bg-destructive" />
        <ColorSwatch name="Destructive Foreground" className="bg-destructive-foreground" />
      </div>
    </div>
  );
}

function ColorSwatch({ name, className, borderClass = "" }: { name: string, className: string, borderClass?: string }) {
  return (
    <div className="flex flex-col">
      <div className={`h-16 rounded-t-md ${className} ${borderClass}`}></div>
      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-b-md border border-t-0 border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium">{name}</p>
      </div>
    </div>
  );
}
