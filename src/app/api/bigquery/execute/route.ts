import { NextRequest, NextResponse } from 'next/server';
import { createBigQueryService } from '../../../../lib/bigquery-service';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      });
    }

    const bigQueryService = createBigQueryService();
    
    if (!bigQueryService) {
      return NextResponse.json({
        success: false,
        error: 'BigQuery service not configured'
      });
    }

    // Execute the query
    const result = await bigQueryService.executeQuery(query);
    
    return NextResponse.json({
      success: true,
      result: result
    });
    
  } catch (error) {
    console.error('BigQuery execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Query execution failed'
    });
  }
}