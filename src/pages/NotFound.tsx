
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/ui/layout";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Layout className="flex items-center justify-center text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-5xl font-bold">404</h1>
        <h2 className="text-2xl">Page Not Found</h2>
        <p className="text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </Layout>
  );
}
