# Solana MCP server

> Connect to the Solana blockchain ecosystem through the Solana MCP server

The **Solana MCP server** is part of Chainstack's RPC Nodes MCP server suite, providing AI models with comprehensive access to the Solana blockchain ecosystem. This server enables real-time Solana interactions, account queries, program calls, and transaction analysis.

## Repository

The Solana MCP server is available in the [chainstacklabs/rpc-nodes-mcp](https://github.com/chainstacklabs/rpc-nodes-mcp) repository, alongside the EVM MCP server for complete blockchain coverage.

## Supported networks

The Solana MCP server supports all Solana networks available on Chainstack:

* **Solana Mainnet** - Production Solana network
* **Solana Devnet** - Development and testing network

## Available functions

The Solana MCP server provides comprehensive Solana blockchain interaction capabilities:

### Account information

* **Get account info** - Retrieve detailed account data and metadata
* **Get account balance** - Check SOL balance for any account
* **Get multiple accounts** - Batch query multiple accounts efficiently
* **Get program accounts** - Find all accounts owned by a specific program

### Block and slot operations

* **Get current slot** - Retrieve the latest processed slot
* **Get block height** - Get the current block height
* **Get block information** - Fetch complete block data with transactions
* **Get block time** - Retrieve block production timestamp
* **Get block commitment** - Check block confirmation status

### Transaction operations

* **Get transaction** - Retrieve transaction details by signature
* **Get signatures for address** - Find all transactions for an account
* **Get signature statuses** - Check transaction confirmation status
* **Get recent blockhash** - Get blockhash for transaction construction

### Network and cluster information

* **Get cluster nodes** - List all validator nodes in the network
* **Get epoch info** - Current epoch details and progress
* **Get epoch schedule** - Epoch timing and slot configuration
* **Get identity** - Node identity and version information
* **Get health** - Check node health and sync status

### Fee and performance data

* **Get fee for message** - Estimate transaction fees
* **Get recent performance samples** - Network performance metrics
* **Get recent prioritization fees** - Current priority fee levels
* **Get minimum balance for rent exemption** - Calculate rent-exempt balance

## Use cases

The Solana MCP server enables AI applications to:

### DeFi and token analysis

* **Monitor SPL token balances** and transfers
* **Track liquidity pools** and DeFi protocol states
* **Analyze trading patterns** on Solana DEXs
* **Monitor yield farming** and staking rewards

### NFT and digital assets

* **Query NFT collections** and metadata
* **Track NFT ownership** and transfer history
* **Monitor marketplace activity** and pricing
* **Analyze digital asset trends** and popularity

### Validator and staking operations

* **Monitor validator performance** and commissions
* **Track staking rewards** and delegations
* **Analyze validator rankings** and metrics
* **Monitor stake pool operations** and performance

### Program development

* **Test program interactions** and account states
* **Debug transaction failures** and program errors
* **Simulate program calls** with different parameters
* **Monitor program usage** and adoption metrics

### Network analytics

* **Analyze network performance** and throughput
* **Monitor epoch transitions** and validator changes
* **Track fee trends** and priority patterns
* **Generate network health** reports and metrics

## Integration with AI models

See the [RPC nodes MCP README file](https://github.com/chainstacklabs/rpc-nodes-mcp/blob/main/README.md) for more information on how to integrate the Solana MCP server with AI models.

The Solana MCP server seamlessly integrates with popular AI development environments:

### Cursor

Configure the server in your [Cursor settings](https://docs.cursor.com/context/model-context-protocol) to access Chainstack's knowledge base directly within your conversations.

### Claude Desktop

Configure the server in your [Claude Desktop settings](https://modelcontextprotocol.io/quickstart/user) to access Chainstack's knowledge base directly within your conversations.

### Claude Code

Configure the server in your [Claude Code settings](https://docs.anthropic.com/en/docs/claude-code/mcp) to access Chainstack's knowledge base directly within your conversations.

### Custom AI applications

Use the MCP protocol to integrate Chainstack's documentation into your own AI-powered development tools and assistants.

## Next steps

<CardGroup cols={2}>
  <Card title="EVM MCP server" href="/docs/evm-mcp-server">
    Add Ethereum and EVM capabilities
  </Card>

  <Card title="Developer Portal MCP server" href="/docs/developer-portal-mcp-server">
    Access documentation and guides
  </Card>

  <Card title="GitHub Repository" href="https://github.com/chainstacklabs/rpc-nodes-mcp" icon="external-link">
    View source code and installation instructions
  </Card>

  <Card title="Solana API Reference" href="/reference/solana-getting-started">
    Explore available Solana methods
  </Card>
</CardGroup>
