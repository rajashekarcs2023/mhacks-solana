2025-09-28T14:37:45.647Z [traders-copilot] [info] Server started and connected successfully { metadata: undefined }
2025-09-28T14:37:45.648Z [traders-copilot] [info] Message from client: {"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"claude-ai","version":"0.1.0"}},"jsonrpc":"2.0","id":0} { metadata: undefined }
npm error code ENOENT
npm error syscall open
npm error path /package.json
npm error errno -2
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/package.json'
npm error enoent This is related to npm not being able to find a file.
npm error enoent
npm error A complete log of this run can be found in: /Users/radhikadanda/.npm/_logs/2025-09-28T14_37_45_804Z-debug-0.log
2025-09-28T14:37:53.799Z [traders-copilot] [info] Initializing server... { metadata: undefined }
2025-09-28T14:37:53.805Z [traders-copilot] [info] Using MCP server command: /usr/local/bin/node with args and path: {
  metadata: {
    args: [ 'dist/server/mcp-server.js', [length]: 1 ],
    paths: [
      '/usr/local/bin',
      '/opt/homebrew/bin',
      '/usr/bin',
      '/usr/bin',
      '/bin',
      '/usr/sbin',
      '/sbin',
      [length]: 7
    ]
  }
} %o
2025-09-28T14:37:53.806Z [traders-copilot] [info] Server started and connected successfully { metadata: undefined }
2025-09-28T14:37:53.819Z [traders-copilot] [info] Message from client: {"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"claude-ai","version":"0.1.0"}},"jsonrpc":"2.0","id":0} { metadata: undefined }
node:internal/modules/cjs/loader:1148
  throw err;
  ^

Error: Cannot find module '/dist/server/mcp-server.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1145:15)
    at Module._load (node:internal/modules/cjs/loader:986:27)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:174:12)
    at node:internal/main/run_main_module:28:49 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v20.16.0
2025-09-28T14:37:53.851Z [traders-copilot] [info] Server transport closed { metadata: undefined }
2025-09-28T14:37:53.851Z [traders-copilot] [info] Client transport closed { metadata: undefined }
2025-09-28T14:37:53.851Z [traders-copilot] [info] Server transport closed unexpectedly, this is likely due to the process exiting early. If you are developing this MCP server you can add output to stderr (i.e. `console.error('...')` in JavaScript, `print('...', file=sys.stderr)` in python) and it will appear in this log. { metadata: undefined }
2025-09-28T14:37:53.851Z [traders-copilot] [error] Server disconnected. For troubleshooting guidance, please visit our [debugging documentation](https://modelcontextprotocol.io/docs/tools/debugging) { metadata: { context: 'connection', stack: undefined } }
2025-09-28T14:37:53.852Z [traders-copilot] [info] Client transport closed { metadata: undefined }
