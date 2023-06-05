export interface TransmitRule<RawObj = any> {
  canEncode?: (data: any) => boolean
  encodeFn?: (data: RawObj) => any
  canDecode?: (data: any) => boolean
  decodeFn?: (data: any) => RawObj
}
