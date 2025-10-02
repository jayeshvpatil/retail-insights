import { NextRequest, NextResponse } from 'next/server';
import { createBigQueryService } from '../../../../lib/bigquery-service';

export async function POST(request: NextRequest) {
  try {
    const bigQueryService = createBigQueryService();
    
    if (!bigQueryService) {
      return NextResponse.json({
        connected: false,
        message: 'BigQuery service not configured. Please check your environment variables.',
        dataSource: 'Simulated'
      });
    }

    // Test the connection
    const connectionResult = await bigQueryService.testConnection();
    
    if (connectionResult) {
      try {
        // Get additional dataset information
        const datasetInfo = await bigQueryService.getDatasetInfo();
        
        return NextResponse.json({
          connected: true,
          message: 'Successfully connected to BigQuery dataset',
          dataSource: 'BigQuery',
          projectId: datasetInfo.projectId,
          datasetId: datasetInfo.datasetId,
          tableCount: datasetInfo.tables.length,
          tables: datasetInfo.tables.map((table: any) => ({
            name: table.tableId,
            rows: table.numRows
          }))
        });
      } catch (error) {
        return NextResponse.json({
          connected: false,
          message: `Connection established but failed to retrieve dataset info: ${error instanceof Error ? error.message : 'Unknown error'}`,
          dataSource: 'Simulated'
        });
      }
    } else {
      return NextResponse.json({
        connected: false,
        message: 'Connection test failed. Please check your credentials and dataset permissions.',
        dataSource: 'Simulated'
      });
    }
    
  } catch (error) {
    console.error('BigQuery test endpoint error:', error);
    
    return NextResponse.json({
      connected: false,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      dataSource: 'Simulated'
    });
  }
}