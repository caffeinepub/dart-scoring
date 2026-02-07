import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

type TestStatus = 'idle' | 'loading' | 'ok' | 'failed';

interface TestResult {
  status: TestStatus;
  message?: string;
}

export default function BackendDebugPanel() {
  const [healthTest, setHealthTest] = useState<TestResult>({ status: 'idle' });
  const [googleStartTest, setGoogleStartTest] = useState<TestResult>({ status: 'idle' });

  const testBackendHealth = async () => {
    setHealthTest({ status: 'loading' });
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
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

  const testGoogleStart = async () => {
    setGoogleStartTest({ status: 'loading' });
    
    try {
      const response = await fetch('/api/auth/google/start', {
        method: 'GET',
        redirect: 'manual', // Don't follow redirects automatically
      });

      // Status 0 means redirect was blocked (opaque response), but endpoint exists
      // Status 200 or 302/303 means success
      // Status 404 means not found
      if (response.type === 'opaqueredirect' || response.status === 0) {
        setGoogleStartTest({ 
          status: 'ok', 
          message: '200/302 (redirect detected)' 
        });
      } else if (response.status === 200 || response.status === 302 || response.status === 303) {
        setGoogleStartTest({ 
          status: 'ok', 
          message: `200/302 (HTTP ${response.status})` 
        });
      } else if (response.status === 404) {
        setGoogleStartTest({ 
          status: 'failed', 
          message: '404 (Not Found)' 
        });
      } else {
        setGoogleStartTest({ 
          status: 'failed', 
          message: `FAILED: HTTP ${response.status}` 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGoogleStartTest({ 
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
            /api (same-origin)
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

        {/* Google start test */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Google OAuth start:</span>
            {renderTestStatus(googleStartTest)}
          </div>
          <Button
            onClick={testGoogleStart}
            disabled={googleStartTest.status === 'loading'}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {googleStartTest.status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Google start'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
