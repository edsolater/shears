import { Commitment, Connection, ConnectionConfig } from "@solana/web3.js"

let currentRpcUrl: string | null = null
let currentConnection: Connection | null = null

// stay in worker
export function getConnection(
  endpointUrlOrConnection: string | Connection,
  commitmentOrConfig: Commitment | ConnectionConfig = "confirmed",
) {
  if (endpointUrlOrConnection instanceof Connection) {
    return endpointUrlOrConnection
  } else if (currentRpcUrl === endpointUrlOrConnection && currentConnection) {
    return currentConnection
  } else {
    const newConnection = new Connection(endpointUrlOrConnection, commitmentOrConfig)
    currentConnection = newConnection
    currentRpcUrl = endpointUrlOrConnection
    return newConnection
  }
}
