export interface TransmitRule {
  canEncode?: (data: any) => boolean
  encodeFn?: (data: any) => any
  canDecode?: (data: any) => boolean
  decodeFn?: (data: any) => any
}
