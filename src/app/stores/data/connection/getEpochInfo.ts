import { EpochInfo } from "@solana/web3.js"
import { getConnection } from "../../../utils/dataStructures/Connection"
import { shuck_rpc } from "../store"
import { assert } from "@edsolater/fnkit"
import { createTimeoutMap } from "../../../../packages/fnkit/createTimeoutMap"

const epochInfoCache = createTimeoutMap<"epochInfo", Promise<EpochInfo>>({ maxAgeMs: 30 * 1000 })

/**
 *
 * @todo cache for 30s
 */
export async function getEpochInfo() {
  const url = shuck_rpc()?.url
  assert(url, "rpc url is not ready")
  const connection = getConnection(url)
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
