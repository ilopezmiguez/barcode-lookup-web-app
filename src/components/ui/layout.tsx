
import React from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
}

export function Layout({
  children,
  className,
  showHeader = true,
  showFooter = true,
  title
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showHeader && (
        <header className="border-b border-border py-4">
          <div className="container flex justify-between items-center">
            <div>
              {title && <h1 className="text-xl font-semibold">{title}</h1>}
            </div>
            <ThemeToggle />
          </div>
        </header>
      )}
      
      <main className={cn("flex-1 container py-8", className)}>
        {children}
      </main>

      {showFooter && (
        <footer className="border-t border-border py-4 mt-auto">
          <div className="container text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} - Built with shadcn/ui</p>
          </div>
        </footer>
      )}
    </div>
  );
}
