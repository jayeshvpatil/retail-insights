import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle, AlertCircle, Database, Loader2 } from 'lucide-react';

interface ConnectionStatus {
  connected: boolean;
  message: string;
  loading: boolean;
  dataSource: 'BigQuery' | 'Simulated' | 'Unknown';
  projectId?: string;
  datasetId?: string;
  tableCount?: number;
}

export function BigQueryConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    message: 'Not tested',
    loading: false,
    dataSource: 'Unknown'
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch('/api/bigquery/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      setStatus({
        connected: result.connected,
        message: result.message,
        loading: false,
        dataSource: result.connected ? 'BigQuery' : 'Simulated',
        projectId: result.projectId,
        datasetId: result.datasetId,
        tableCount: result.tableCount
      });
    } catch (error) {
      setStatus({
        connected: false,
        message: 'Failed to test connection',
        loading: false,
        dataSource: 'Simulated'
      });
    }
  };

  useEffect(() => {
    // Auto-test connection on mount
    testConnection();
  }, []);

  const getStatusIcon = () => {
    if (status.loading) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (status.connected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status.dataSource === 'Simulated') {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadgeClass = () => {
    if (status.connected) return 'bg-green-500 text-white';
    if (status.dataSource === 'Simulated') return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Data Connection Status</CardTitle>
          </div>
          <span className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClass()}`}>
            {getStatusIcon()}
            {status.dataSource}
          </span>
        </div>
        <CardDescription>
          {status.connected 
            ? 'Connected to live BigQuery dataset for real-time analytics'
            : 'Using simulated data for demonstration purposes'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-slate-700 mb-1">Connection Details:</p>
          <p className="text-sm text-slate-600">{status.message}</p>
          
          {status.projectId && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-slate-500">Project: {status.projectId}</p>
              <p className="text-xs text-slate-500">Dataset: {status.datasetId}</p>
              {status.tableCount && (
                <p className="text-xs text-slate-500">Tables: {status.tableCount}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">
              {status.connected ? 'Live Data Analytics' : 'Demo Mode'}
            </p>
            <p className="text-xs text-slate-500">
              {status.connected 
                ? 'SQL queries execute against real BigQuery dataset'
                : 'SQL queries return realistic simulated retail data'
              }
            </p>
          </div>
          
          <Button 
            onClick={testConnection}
            disabled={status.loading}
            size="sm"
            variant={status.connected ? "outline" : "default"}
          >
            {status.loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>

        {!status.connected && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Setup BigQuery Connection</p>
                <p className="text-yellow-700 text-xs">
                  To connect to your BigQuery dataset, configure the environment variables in your .env.local file:
                </p>
                <ul className="list-disc list-inside text-xs text-yellow-600 mt-1 space-y-0.5">
                  <li>NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID</li>
                  <li>NEXT_PUBLIC_BIGQUERY_DATASET_ID</li>
                  <li>GOOGLE_SERVICE_ACCOUNT_KEY (or GOOGLE_APPLICATION_CREDENTIALS)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}