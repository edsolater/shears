it's a fake version of Raydium V2

component name meanings:

- `xxxFace`: `xxxItem` + `xxxTrigger`
- buildComponent - generate plugins

svg background: https://loading.io/background/

# Data flow

worker thread: JSON info ==> JSON info + SDK info ==> Composed info
main thread: Composed info ==> UI info (has decimaled) (hook:useXXXInfo)
