import { NextRequest, NextResponse } from 'next/server';
import { createLangChainBigQueryAgent } from '../../../lib/langchain-bigquery-agent';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      });
    }

    console.log('LangChain API processing query:', query);
    
    // Create and initialize the agent
    const agent = await createLangChainBigQueryAgent();
    const result = await agent.processQuery(query);
    
    return NextResponse.json({
      success: true,
      response: result.answer,
      output: result.answer,
      intermediateSteps: result.reasoning,
      executionTime: result.executionTime
    });
    
  } catch (error) {
    console.error('LangChain API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Query processing failed',
      response: 'I encountered an issue processing your request. Please try again with a simpler question.'
    });
  }
}