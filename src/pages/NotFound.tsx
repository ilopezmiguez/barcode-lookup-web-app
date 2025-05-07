
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { Link } from "react-router-dom";
import ReportMissingProductDialog from "@/components/ReportMissingProductDialog";

export default function NotFound() {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  return (
    <Layout className="flex items-center justify-center text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-5xl font-bold">404</h1>
        <h2 className="text-2xl">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
          <Button variant="outline" onClick={() => setIsReportDialogOpen(true)}>
            Report Missing Product
          </Button>
        </div>
      </div>
      
      <ReportMissingProductDialog 
        open={isReportDialogOpen} 
        onOpenChange={setIsReportDialogOpen}
      />
    </Layout>
  );
}
