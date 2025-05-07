
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function ButtonVariants() {
  return (
    <div className="flex flex-col gap-6">
      <h3>Button Variants</h3>
      <div className="flex flex-wrap gap-4">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
      
      <h4>Button Sizes</h4>
      <div className="flex flex-wrap gap-4 items-center">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">
          <Check className="size-4" />
        </Button>
      </div>
      
      <h4>Button States</h4>
      <div className="flex flex-wrap gap-4">
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
        <Button className="button-with-icon">
          <Check /> With Icon
        </Button>
        <Button variant="destructive" className="button-with-icon">
          <X /> Delete
        </Button>
      </div>
    </div>
  );
}
