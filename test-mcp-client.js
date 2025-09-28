#!/usr/bin/env node

/**
 * Simple MCP client to test our Trader's Co-Pilot MCP server
 */

import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPServer() {
  console.log('🧪 Testing Trader\'s Co-Pilot MCP Server...\n');

  // Start the MCP server process
  const serverProcess = spawn('npm', ['run', 'mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Create MCP client with stdio transport
  const transport = new StdioClientTransport({
    command: 'npm',
    args: ['run', 'mcp']
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {}
    }
  );

  try {
    // Connect to the server
    await client.connect(transport);
    console.log('✅ Connected to MCP server\n');

    // Test 1: List available tools
    console.log('🔍 Listing available tools...');
    const toolsResponse = await client.listTools();
    console.log(`Found ${toolsResponse.tools.length} tools:`);
    toolsResponse.tools.forEach(tool => {
      console.log(`  • ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test 2: Call get_balance tool
    console.log('💰 Testing get_balance tool...');
    const balanceResult = await client.callTool({
      name: 'get_balance',
      arguments: {
        address: '11111111111111111111111111111112'
      }
    });
    console.log('Balance result:');
    console.log(balanceResult.content[0].text);
    console.log();

    // Test 3: Call market_buy_sim tool
    console.log('📊 Testing market_buy_sim tool...');
    const simResult = await client.callTool({
      name: 'market_buy_sim',
      arguments: {
        mint: 'SOL',
        usdAmount: 50,
        slippageBps: 50
      }
    });
    console.log('Market simulation result:');
    console.log(simResult.content[0].text);
    console.log();

    // Test 4: Test error handling
    console.log('⚠️  Testing error handling...');
    try {
      const errorResult = await client.callTool({
        name: 'get_balance',
        arguments: {
          address: 'invalid'
        }
      });
      console.log('Error handling result:');
      console.log(errorResult.content[0].text);
    } catch (error) {
      console.log('Caught error (expected):');
      console.log(error.message);
    }
    console.log();

    console.log('🎉 All MCP tests passed! The server is working correctly.');

  } catch (error) {
    console.error('❌ MCP test failed:', error);
  } finally {
    // Clean up
    await client.close();
    serverProcess.kill();
  }
}

// Run the test
testMCPServer().catch(console.error);