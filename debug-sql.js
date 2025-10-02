// Test script to debug SQL query generation
const { SupervisorAgent } = require('./src/lib/multi-agent-system');

async function testQuery() {
  try {
    const supervisor = new SupervisorAgent();
    console.log('Testing SQL query generation...');
    
    const result = await supervisor.processQuery("What are our top selling products?");
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testQuery();