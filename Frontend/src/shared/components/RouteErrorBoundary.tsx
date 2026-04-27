import { useRouteError, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { AlertCircle } from 'lucide-react';

export function RouteErrorBoundary() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error('Route error:', error);

  return (
    <div className="h-[80vh] w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">Page Error</CardTitle>
          <CardDescription>
            We encountered an error while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {import.meta.env.DEV && (
            <div className="p-3 bg-muted rounded-md text-xs font-mono overflow-auto max-h-40 text-left">
              {error?.message || error?.statusText || 'Unknown Error'}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
            Go Home
          </Button>
          <Button variant="default" onClick={() => window.location.reload()} className="flex-1">
            Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
