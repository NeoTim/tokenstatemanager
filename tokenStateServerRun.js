// START and APP ENTRY
/*
Running two servers
1)  https: port 3000 external access
    only /status and to initiate new code from oauth2 external api and to capture this code upon approval
2)  http: port 3001 internal access only
    getting token and refreshing token - allows commands: /token, /refreshtoken, /help, /status

*/
const secureServer = require("./outsideSecureServer")
const localServer = require("./localServer")

secureServer.startOutsideServer()
localServer.startInsideServer()

process.on('SIGTERM', () => {
    secureServer.stopOutsideServer()
    localServer.stopInsideServer()
  })

  process.on('SIGINT', () => {
    secureServer.stopOutsideServer()
    localServer.stopInsideServer()
  })