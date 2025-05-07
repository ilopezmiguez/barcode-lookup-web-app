
export function TypographyShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <h2>Typography</h2>
      
      <div className="space-y-4">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        
        <div className="space-y-2">
          <p className="text-base">Body text (base)</p>
          <p className="text-sm">Small text</p>
          <p className="text-xs">Extra small text</p>
          <p className="text-lg">Large text</p>
          <p className="text-xl">Extra large text</p>
          <p className="font-semibold">Semibold text</p>
          <p className="font-bold">Bold text</p>
          <p className="italic">Italic text</p>
          <p className="underline">Underlined text</p>
          <p className="text-muted-foreground">Muted text</p>
          <p className="lead">Lead paragraph</p>
          <p><code>Code snippet</code></p>
          <blockquote>This is a blockquote element showing indented quoted text.</blockquote>
        </div>
      </div>
    </div>
  );
}
