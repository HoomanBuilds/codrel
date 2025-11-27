import { envConfig } from "../config/env.js";
import { createStdioMcpServer, createStdioMcpTransport } from "./server.js";

export const stdioMcpHandler = async () => {

  const token = getToken()

  if(!token) return
  const server = createStdioMcpServer(token);
  await createStdioMcpTransport(server);
  console.error("codrelAi stdio mcp server running");
};


stdioMcpHandler();

function getToken() {
  return envConfig.codrel.token
}