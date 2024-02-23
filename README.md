it's a fake version of Raydium V2

component name meanings:

- `xxxFace`: `xxxItem` + `xxxTrigger`
- buildComponent - generate plugins


svg background: https://loading.io/background/


# Data flow
worker thread: JSON info ==> JSON info + SDK info
main thread: JSON info + SDK info ==(hook:useXXXInfo)=> UI info