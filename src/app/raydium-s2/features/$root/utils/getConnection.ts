import { Commitment, Connection, ConnectionConfig } from '@solana/web3.js';
import { rpcEndpointUrl } from './config';


export function getConnection(endpoint: string = rpcEndpointUrl, commitmentOrConfig: Commitment | ConnectionConfig = 'confirmed') {
  return new Connection(endpoint, commitmentOrConfig);
}
