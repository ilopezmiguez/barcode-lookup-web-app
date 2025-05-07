
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CardVariants() {
  return (
    <div className="flex flex-col gap-6">
      <h3>Card Variants</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simple Card</CardTitle>
            <CardDescription>A basic card layout with header</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a simple card with minimal styling.</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-design-accent">
          <CardHeader className="bg-design-accent/20">
            <CardTitle>Accented Card</CardTitle>
            <CardDescription>A card with accent styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card uses our accent color for emphasis.</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle>Hover Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card has a hover effect.</p>
          </CardContent>
        </Card>
        
        <Card className="bg-design-typography text-white">
          <CardHeader>
            <CardTitle className="text-white">Inverted Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>A card with inverted colors.</p>
          </CardContent>
        </Card>
        
        <Card className="border border-design-detail">
          <CardHeader className="border-b border-design-detail">
            <CardTitle>Bordered Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This card has custom borders.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
