import { Commitment, Connection, ConnectionConfig } from '@solana/web3.js'
import { appRpcEndpointUrl } from './config'

let currentRpcUrl: string | null = null
let currentConnection: Connection | null = null

export function getConnection(
  endpoint: string = appRpcEndpointUrl,
  commitmentOrConfig: Commitment | ConnectionConfig = 'confirmed',
) {
  if (currentRpcUrl === endpoint && currentConnection) {
    return currentConnection
  } else {
    const newConnection = new Connection(endpoint, commitmentOrConfig)
    currentConnection = newConnection
    currentRpcUrl = endpoint
    return newConnection
  }
}
