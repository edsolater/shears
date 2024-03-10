import { assert } from "@edsolater/fnkit"
import { EpochInfo } from "@solana/web3.js"
import { createTimeoutMap } from "../../../../packages/fnkit/createTimeoutMap"
import { getConnection } from "../../../utils/dataStructures/Connection"

const epochInfoCache = createTimeoutMap<"epochInfo", Promise<EpochInfo>>({ maxAgeMs: 30 * 1000 })

/**
 *
 * @todo cache for 30s
 */
export async function getEpochInfo(payload: { rpcUrl: string }) {
  assert(payload.rpcUrl, "rpc url is not ready")
  const connection = getConnection(payload.rpcUrl)
  if (!connection) return Promise.reject("connection is not ready")
  const v = epochInfoCache.get("epochInfo")
  if (!v) {
    const i = connection.getEpochInfo()
    epochInfoCache.set("epochInfo", i)
    return i
  } else {
    return v
  }
}