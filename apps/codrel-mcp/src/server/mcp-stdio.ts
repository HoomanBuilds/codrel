import { createStdioMcpServer, createStdioMcpTransport } from "./server.js";

export const stdioMcpHandler = async () => {
  const server = createStdioMcpServer();
  await createStdioMcpTransport(server);
  console.error("codrelAi stdio mcp server running");
};

stdioMcpHandler();
