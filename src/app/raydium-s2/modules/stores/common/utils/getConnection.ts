import { Commitment, Connection, ConnectionConfig } from '@solana/web3.js';
import { appRpcEndpointUrl } from './config';


export function getConnection(endpoint: string = appRpcEndpointUrl, commitmentOrConfig: Commitment | ConnectionConfig = 'confirmed') {
  return new Connection(endpoint, commitmentOrConfig);
}
