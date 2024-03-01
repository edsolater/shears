import { Commitment, Connection, ConnectionConfig } from '@solana/web3.js'

let currentRpcUrl: string | null = null
let currentConnection: Connection | null = null

// stay in worker
export function getConnection(endpointUrl: string, commitmentOrConfig: Commitment | ConnectionConfig = 'confirmed') {
  if (currentRpcUrl === endpointUrl && currentConnection) {
    return currentConnection
  } else {
    const newConnection = new Connection(endpointUrl, commitmentOrConfig)
    currentConnection = newConnection
    currentRpcUrl = endpointUrl
    return newConnection
  }
}
