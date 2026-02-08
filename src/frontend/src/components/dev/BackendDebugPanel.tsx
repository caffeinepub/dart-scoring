import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { BACKEND_URL } from '../../lib/config';

type TestStatus = 'idle' | 'loading' | 'ok' | 'failed';

interface TestResult {
  status: TestStatus;
  message?: string;
}

export default function BackendDebugPanel() {
  const [healthTest, setHealthTest] = useState<TestResult>({ status: 'idle' });

  const testBackendHealth = async () => {
    setHealthTest({ status: 'loading' });
    
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        credentials: 'omit',
      });

      if (response.status === 200) {
        setHealthTest({ status: 'ok', message: 'OK' });
      } else {
        setHealthTest({ 
          status: 'failed', 
          message: `FAILED: HTTP ${response.status}` 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setHealthTest({ 
        status: 'failed', 
        message: `FAILED: ${errorMessage}` 
      });
    }
  };

  const renderTestStatus = (result: TestResult) => {
    switch (result.status) {
      case 'idle':
        return <span className="text-muted-foreground text-sm">Not tested</span>;
      case 'loading':
        return (
          <span className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Testing...
          </span>
        );
      case 'ok':
        return (
          <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            {result.message || 'OK'}
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            {result.message || 'FAILED'}
          </span>
        );
    }
  };

  return (
    <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          Backend Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Detected backend URL */}
        <div>
          <p className="font-medium mb-1">Backend URL:</p>
          <code className="block bg-background px-2 py-1 rounded text-xs break-all">
            {BACKEND_URL}
          </code>
        </div>

        {/* Health test */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Health endpoint:</span>
            {renderTestStatus(healthTest)}
          </div>
          <Button
            onClick={testBackendHealth}
            disabled={healthTest.status === 'loading'}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {healthTest.status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Testing...
              </>
            ) : (
              'Test backend'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
