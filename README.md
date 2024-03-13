it's a fake version of Raydium V2

component name meanings:

- `xxxFace`: `xxxItem` + `xxxTrigger`
- buildComponent - generate plugins

svg background: https://loading.io/background/

# Data flow

worker thread: JSON info ==> JSON info + SDK info ==> Composed info
main thread: Composed info ==> UI info (has decimaled) (hook:useXXXInfo)

# Map

- main thread: ui show data
- worker thread:
  - fetch json file
  - parse sdk file
  - compose to Composed info
  - handle tx functions

# Tx steps example

1. UI click
2. invoke method exposed by a ui data hooks(e.g. `useClmmPosition()`) // this step make txDispatcher easier to use
3. txDispatcher in main thread // for sdk info is in worker thread, so have to transfer 
4. txDispatcher in worker thread
5. core algorithm of transaction(e.g. clmmPositionIncrease)
