import { AnyFn } from '@edsolater/fnkit'
import { RowItem, RowItemProps } from '@edsolater/pivkit'
import { createEffect } from 'solid-js'
import copyToClipboard from '../../../packages/domkit/copyToClipboard'
import { KitProps, useKitProps } from '../../../packages/piv/createKit'
import { createToggle } from '../../../packages/pivkit/hooks/createToggle'

type AddressItemProps = KitProps<
  {
    canCopy?: boolean
    showCopyIcon?: boolean
    canExternalLink?: boolean
    /** default sm */
    // iconSize?: IconProps['size']
    className?: string
    textClassName?: string
    iconClassName?: string
    publicKey: string
    showDigitCount?: number | 'all'
    addressType?: 'token' | 'account'
    iconRowClassName?: string
    onCopied?(text: string): void // TODO: imply it
  },
  { extendsProp: RowItemProps }
>

/**
 * base on {@link RowItem}
 */
export function AddressItem(rawProps: AddressItemProps) {
  const props = useKitProps(rawProps)

  const [isCopied, { delayOff, on }] = createToggle(false, { delay: 400 })

  createEffect(() => {
    if (isCopied()) delayOff()
  })

  const handleClickCopy = (ev: { stopPropagation: AnyFn }) => {
    ev.stopPropagation()
    if (!isCopied)
      copyToClipboard(props.publicKey)
        .then(on)
        .then(() => props.onCopied?.(props.publicKey))
  }

  if (!props.publicKey) return null
  return null
  // return (
  //   <RowItem
  //     shadowProps={props}
  //     suffix={
  //       props.canCopy || props.canExternalLink ? (
  //         <Row className={twMerge(`${iconSize === 'xs' ? 'gap-0.5 ml-1.5' : 'gap-1 ml-3'}`, iconRowClassName)}>
  //           {showCopyIcon ? (
  //             <Icon
  //               size={iconSize}
  //               className={twMerge('clickable text-[#ABC4FF]', iconClassName)}
  //               heroIconName='clipboard-copy'
  //               onClick={({ ev }) => handleClickCopy(ev)}
  //             />
  //           ) : null}
  //           {canExternalLink ? (
  //             <LinkExplorer hrefDetail={`${publicKey}`} type={addressType}>
  //               <Icon
  //                 size={iconSize}
  //                 heroIconName='external-link'
  //                 className={twMerge('clickable text-[#ABC4FF]', iconClassName)}
  //               />
  //             </LinkExplorer>
  //           ) : null}
  //         </Row>
  //       ) : null
  //     }
  //   >
  //     <div title={toPubString(publicKey)} className='relative' onClick={(ev) => canCopy && handleClickCopy(ev)}>
  //       <div className={`${isCopied ? 'opacity-10' : 'opacity-100'} transition`}>
  //         {showDigitCount === 'all'
  //           ? `${toPubString(publicKey)}`
  //           : `${toPubString(publicKey).slice(0, showDigitCount)}...${toPubString(publicKey).slice(
  //               -1 * showDigitCount
  //             )}`}
  //       </div>
  //       <div
  //         className={`absolute inset-0 ${
  //           isCopied ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  //         } transition flex items-center justify-center`}
  //       >
  //         Copied
  //       </div>
  //     </div>
  //   </RowItem>
  // )
}
