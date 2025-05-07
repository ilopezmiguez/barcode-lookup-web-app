
export function SpacingSystem() {
  return (
    <div className="flex flex-col gap-6">
      <h2>Spacing System</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3>Vertical Spacing</h3>
          <div className="flex flex-col items-start border border-dashed border-gray-300 dark:border-gray-600 p-4">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
              <div key={size} className="flex items-center gap-4">
                <div className={`bg-design-accent w-full h-${size}`}></div>
                <span className="text-sm font-mono whitespace-nowrap">
                  {size === 1 ? '0.25rem' :
                   size === 2 ? '0.5rem' :
                   size === 3 ? '0.75rem' :
                   size === 4 ? '1rem' :
                   size === 6 ? '1.5rem' :
                   size === 8 ? '2rem' :
                   size === 12 ? '3rem' : '4rem'} (${size})
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3>Horizontal Spacing</h3>
          <div className="border border-dashed border-gray-300 dark:border-gray-600 p-4">
            <div className="flex items-end gap-2 flex-wrap">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div className={`bg-design-typography w-${size} h-16`}></div>
                  <span className="text-xs font-mono">{size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <h3>Margin & Padding Examples</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border border-dashed border-gray-300 dark:border-gray-600">
          <div className="bg-design-accent/20 m-4 p-4 border border-design-accent">
            m-4 p-4
          </div>
        </div>
        
        <div className="border border-dashed border-gray-300 dark:border-gray-600">
          <div className="bg-design-accent/20 mx-8 my-4 p-4 border border-design-accent">
            mx-8 my-4 p-4
          </div>
        </div>
        
        <div className="border border-dashed border-gray-300 dark:border-gray-600">
          <div className="bg-design-accent/20 m-2 p-8 border border-design-accent">
            m-2 p-8
          </div>
        </div>
      </div>
    </div>
  );
}
