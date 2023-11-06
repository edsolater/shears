import { Piv, useKitProps } from '../../../../../packages/pivkit'
import { OptionItemBox } from './OptionItem'

export function RpcItemFace(kitProps: {
  currentRPC?: {
    name?: string
    url?: string
  }
  isLoading?: boolean
  isLoadingCustomizedRPC?: boolean
}) {
  const { props, shadowProps } = useKitProps(kitProps)

  const dotIcss = {
    width: '0.375rem',
    height: '0.375rem',
    background: '#2de680',
    color: '#2de680',
    borderRadius: '50%',
    boxShadow: '0 0 6px 1px currentColor',
  }
  return (
    <OptionItemBox render:arrow shadowProps={shadowProps} render:dot={<Piv icss={dotIcss}></Piv>}>
      RPC
    </OptionItemBox>
  )
}

// function RpcConnectionFaceOld(kitProps: {
//   currentRPC?: {
//     name?: string
//     url?: string
//   }
//   isLoading?: boolean
//   isLoadingCustomizedRPC?: boolean
// }) {
//   const { props, shadowProps } = useKitProps(kitProps)

//   return (
//     <div className='block py-4 mobile:py-3 px-8 pl-6 mobile:px-5 hover:bg-[rgba(57,208,216,0.1)] active:bg-[rgba(41,157,163,0.3)] cursor-pointer group'>
//       <Row className='items-center w-full mobile:justify-center'>
//         <div className='h-4 w-4 mobile:w-3 mobile:h-3 grid place-items-center mr-3 '>
//           {isLoading ? (
//             <Icon iconClassName='h-4 w-4 mobile:w-3 mobile:h-3' iconSrc='/icons/loading-dual.svg' />
//           ) : (
//             <div
//               className={`w-1.5 h-1.5 mobile:w-1 mobile:h-1 bg-[#2de680] text-[#2de680] rounded-full`}
//               style={{
//                 boxShadow: '0 0 6px 1px currentColor',
//               }}
//             />
//           )}
//         </div>
//         <span
//           className='text-[rgba(172,227,229)] text-sm mobile:text-xs font-medium flex-grow overflow-ellipsis overflow-hidden'
//           title={currentEndPoint?.url}
//         >
//           {currentEndPoint
//             ? isLoading
//               ? `RPC (${
//                   (loadingCustomizedEndPoint?.name ?? extractRPCName(loadingCustomizedEndPoint?.url ?? '')) || ''
//                 })`
//               : `RPC (${(currentEndPoint?.name ?? extractRPCName(currentEndPoint.url)) || ''})`
//             : '--'}
//         </span>
//         <Icon size={isMobile ? 'xs' : 'sm'} heroIconName='chevron-right' iconClassName='text-[#ACE3E6]' />
//       </Row>
//     </div>
//   )
// }
