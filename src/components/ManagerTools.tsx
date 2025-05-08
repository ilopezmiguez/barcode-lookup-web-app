
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Check, ExternalLink, Loader, Settings, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const ManagerTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clearAfterSending, setClearAfterSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const { toast } = useToast();

  const sendReport = async () => {
    setStatus('sending');
    setStatusMessage('Sending report...');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-missing-products-report', {
        body: { clearList: clearAfterSending }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setStatus('success');
        setStatusMessage(data.message);
        toast({
          title: "Report sent successfully",
          description: data.message,
        });
      } else {
        setStatus('error');
        setStatusMessage(data.message || 'No missing products found');
        toast({
          title: "No data to send",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error sending report:', err);
      setStatus('error');
      setStatusMessage(err instanceof Error ? err.message : 'Failed to send report');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to send report',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-background border-t border-border shadow-lg"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center p-2 rounded-none border-b border-border"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manager Tools
            {isOpen ? <X className="h-4 w-4 ml-auto" /> : null}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4">
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Missing Products Report</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="clearList" 
                  checked={clearAfterSending} 
                  onCheckedChange={(checked) => setClearAfterSending(checked === true)}
                  disabled={status === 'sending'}
                />
                <label 
                  htmlFor="clearList" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Clear list after sending?
                </label>
              </div>
              
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertDescription className="text-xs flex items-center gap-2">
                  <span>During testing, reports will only be sent to your verified email address. To send to other recipients, you need to verify a domain in Resend.</span>
                  <a 
                    href="https://resend.com/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline"
                  >
                    Verify domain <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </AlertDescription>
              </Alert>
              
              {status !== 'idle' && (
                <Alert variant={status === 'error' ? 'destructive' : status === 'success' ? 'default' : 'default'}>
                  <AlertDescription className="flex items-center">
                    {status === 'sending' && <Loader className="h-4 w-4 animate-spin mr-2" />}
                    {status === 'success' && <Check className="h-4 w-4 mr-2" />}
                    {status === 'error' && <X className="h-4 w-4 mr-2" />}
                    {statusMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={sendReport} 
                disabled={status === 'sending'}
                className="w-full"
              >
                {status === 'sending' ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Sending Report...
                  </>
                ) : (
                  'Send Missing Products Report'
                )}
              </Button>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ManagerTools;
