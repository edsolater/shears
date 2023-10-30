import { store } from '../../../stores/data/store'

function SideMenu_RpcOptionItem() {
  return (
    <Popover renderPopoverContent={({ close }) => <RpcConnectionPanelPopover close={close} />}>
      <RpcConnectionFace />
    </Popover>
  )
}

function RpcConnectionFace() {
  const currentEndPoint = () => store.rpcUrl
  const isLoading = () => store.isRpcLoading

  return (
    <div className='block py-4 mobile:py-3 px-8 pl-6 mobile:px-5 hover:bg-[rgba(57,208,216,0.1)] active:bg-[rgba(41,157,163,0.3)] cursor-pointer group'>
      <Row className='items-center w-full mobile:justify-center'>
        <div className='h-4 w-4 mobile:w-3 mobile:h-3 grid place-items-center mr-3 '>
          {isLoading ? (
            <Icon iconClassName='h-4 w-4 mobile:w-3 mobile:h-3' iconSrc='/icons/loading-dual.svg' />
          ) : (
            <div
              className={`w-1.5 h-1.5 mobile:w-1 mobile:h-1 bg-[#2de680] text-[#2de680] rounded-full`}
              style={{
                boxShadow: '0 0 6px 1px currentColor',
              }}
            />
          )}
        </div>
        <span
          className='text-[rgba(172,227,229)] text-sm mobile:text-xs font-medium flex-grow overflow-ellipsis overflow-hidden'
          title={currentEndPoint?.url}
        >
          {currentEndPoint
            ? isLoading
              ? `RPC (${(isLoading?.name ?? extractRPCName(isLoading?.url ?? '')) || ''})`
              : `RPC (${(currentEndPoint?.name ?? extractRPCName(currentEndPoint.url)) || ''})`
            : '--'}
        </span>
        <Icon size={isMobile ? 'xs' : 'sm'} heroIconName='chevron-right' iconClassName='text-[#ACE3E6]' />
      </Row>
    </div>
  )
}
function RpcConnectionPanelPopover({ close: closePanel }: { close: () => void }) {
  const availableEndPoints = useConnection((s) => s.availableEndPoints)
  const availableDevEndPoints = useConnection((s) => s.availableDevEndPoints)
  const currentEndPoint = useConnection((s) => s.currentEndPoint)
  const autoChoosedEndPoint = useConnection((s) => s.autoChoosedEndPoint)
  const userCostomizedUrlText = useConnection((s) => s.userCostomizedUrlText)
  const switchConnectionFailed = useConnection((s) => s.switchConnectionFailed)
  const switchRpc = useConnection((s) => s.switchRpc)
  const deleteRpc = useConnection((s) => s.deleteRpc)
  const isLoading = useConnection((s) => s.isLoading)
  return (
    <>
      <div className='pt-3 -mb-1 mobile:mb-2 px-6 mobile:px-3 text-[rgba(171,196,255,0.5)] text-xs mobile:text-sm'>
        RPC CONNECTION
      </div>
      <div className='gap-3 divide-y-1.5'>
        {availableEndPoints.concat(availableDevEndPoints ?? []).map((endPoint) => {
          const isCurrentEndPoint = currentEndPoint?.url === endPoint.url
          return (
            <Row
              key={endPoint.url}
              className='group flex-wrap gap-3 py-4 px-6 mobile:px-3 border-[rgba(171,196,255,0.05)]'
              onClick={() => {
                if (endPoint.url !== currentEndPoint?.url) {
                  switchRpc(endPoint).then((result) => {
                    if (result === true) {
                      closePanel()
                    }
                  })
                }
              }}
            >
              <Row className='items-center w-full'>
                <Row
                  className={`${
                    isCurrentEndPoint
                      ? 'text-[rgba(255,255,255,0.85)]'
                      : 'hover:text-white active:text-white text-white cursor-pointer'
                  } items-center w-full`}
                >
                  {endPoint.name ?? '--'}
                  {endPoint.url === autoChoosedEndPoint?.url && <Badge className='self-center ml-2'>recommended</Badge>}
                  {endPoint.isUserCustomized && (
                    <Badge className='self-center ml-2' cssColor='#c4d6ff'>
                      user added
                    </Badge>
                  )}
                  {isCurrentEndPoint && (
                    <Icon
                      className='justify-self-end ml-auto text-[rgba(255,255,255,0.85)] clickable  transition'
                      iconClassName='ml-6'
                      heroIconName='check'
                    ></Icon>
                  )}
                  {endPoint.isUserCustomized && !isCurrentEndPoint && (
                    <Icon
                      className='justify-self-end ml-auto text-red-600 clickable opacity-0 group-hover:opacity-100 transition'
                      iconClassName='ml-6'
                      heroIconName='trash'
                      onClick={({ ev }) => {
                        deleteRpc(endPoint.url)
                        ev.stopPropagation()
                      }}
                    ></Icon>
                  )}
                </Row>
                {isLoading && endPoint === currentEndPoint && (
                  <Icon className='ml-3' iconClassName='h-4 w-4' iconSrc='/icons/loading-dual.svg' />
                )}
              </Row>
            </Row>
          )
        })}

        <Row className='border-[rgba(171,196,255,0.05)] items-center gap-3 p-4 mobile:py-4 mobile:px-2'>
          <Input
            value={userCostomizedUrlText}
            className={`px-2 py-2 border-1.5 flex-grow ${
              switchConnectionFailed
                ? 'border-[#DA2EEF]'
                : userCostomizedUrlText === currentEndPoint?.url
                ? 'border-[rgba(196,214,255,0.8)]'
                : 'border-[rgba(196,214,255,0.2)]'
            } rounded-xl min-w-[7em]`}
            inputClassName='font-medium text-[rgba(196,214,255,0.5)] placeholder-[rgba(196,214,255,0.5)]'
            placeholder='https://'
            onUserInput={(searchText) => {
              useConnection.setState({ userCostomizedUrlText: searchText.trim() })
            }}
            onEnter={() => {
              switchRpc({ url: userCostomizedUrlText }).then((isSuccess) => {
                if (isSuccess === true) {
                  closePanel()
                }
              })
            }}
          />
          <Button
            className='frosted-glass-teal'
            onClick={() => {
              switchRpc({ url: userCostomizedUrlText }).then((isSuccess) => {
                if (isSuccess === true) {
                  closePanel()
                }
              })
            }}
          >
            Switch
          </Button>
        </Row>
      </div>
    </>
  )
}
