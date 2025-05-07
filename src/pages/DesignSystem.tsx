
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonVariants } from "@/components/design-system/ButtonVariants";
import { CardVariants } from "@/components/design-system/CardVariants";
import { ColorPalette } from "@/components/design-system/ColorPalette";
import { SpacingSystem } from "@/components/design-system/SpacingSystem";
import { TypographyShowcase } from "@/components/design-system/TypographyShowcase";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Separator } from "@/components/ui/separator";

export default function DesignSystem() {
  return (
    <div className="container py-10 space-y-10">
      <div className="flex justify-between items-center">
        <h1>Design System</h1>
        <ThemeToggle />
      </div>
      
      <p className="lead">
        A comprehensive design system with color palette, typography scale, 
        spacing system, and component variants. The system includes
        dark mode support and ensures all components are accessible (WCAG AA compliant).
      </p>
      
      <Tabs defaultValue="colors">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colors">
          <Card>
            <CardContent className="pt-6">
              <ColorPalette />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="typography">
          <Card>
            <CardContent className="pt-6">
              <TypographyShowcase />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="spacing">
          <Card>
            <CardContent className="pt-6">
              <SpacingSystem />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="components">
          <Card>
            <CardContent className="pt-6 space-y-12">
              <ButtonVariants />
              <Separator />
              <CardVariants />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 border border-design-accent bg-design-accent/10 rounded-md">
        <h3>A11y Accessibility Features</h3>
        <ul className="list-disc pl-6">
          <li>All interactive elements are keyboard accessible with proper focus states</li>
          <li>Color contrast ratios meet or exceed WCAG AA requirements (4.5:1 for normal text)</li>
          <li>Proper heading hierarchy is implemented throughout the design system</li>
          <li>All UI components include proper aria labels and roles</li>
          <li>Text spacing and line heights follow accessibility best practices</li>
          <li>Dark mode provides alternative color schemes for users with light sensitivity</li>
        </ul>
      </div>
    </div>
  );
}
