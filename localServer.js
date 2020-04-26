/*
outsideSecureServer
running 3001 listening port for API to access token
  * /token - returns last token
    * ?valid - returns only a valid token, will refresh token if needed
    * ?update - forces a refresh of token
    * //TODO: ?auto=(0,1) - to turn on auto refresh of token (****NOT IMPLEMENTED****)
  * /refresh - returns refresh token
    * ?update - forces a refresh of refresh token
    * //TODO: ?auto=(0,1) - to turn on auto refresh of refresh token (****NOT IMPLEMENTED****)
  * /help - return what commands are avail
    * /help routine on what commands are available: response command, query options, description
  * if file gets too large - build logic into a separate file to interact with external api client and database store
*/

const express = require('express')
const config = require('./config')
const app_tokenstate = express() // local server access only so no auth
const port = config.app.insidePort
const tokenStore = require("./tokenStore") // data layer
const tokenAccess = require('./tdapi_client') // client to form requests to external API
const logger = require("./logger").Logger // quick and simple logger setup
let server

app_tokenstate.get('/refresh', (request, response) => {
  logger.info("server_local(/refresh): requested")
  // request refresh token
  if (Object.keys(request.query).length == 0)
    tokenStore.getRefreshToken()
      .then(refresh => response.send(refresh))

  // request update to force new refresh token
  else if (request.query.update == '')
    forceRefresh().then(refresh => response.send(refresh))
  
  // invalid query
  else
    response.json({ "query": "invalid" })
})

app_tokenstate.get('/token', (request, response) => {
  //TODO: Should be checking for only one query value and send error on multiple
  logger.info(`server_local(/token): requested - query: ${JSON.stringify(request.query)}`)
  // request updated token - no query
  if (Object.keys(request.query).length == 0)
    tokenStore.getToken()
      .then(token => response.send(token))

  // request only a valid token
  else if (request.query.valid == '')
    getValidToken().then(token => response.send(token))

  // force an update and a new token
  else if (request.query.update == '')
    getValidToken("TRUE").then(token => response.send(token))

  // invalid query
  else
    response.json({ "query": "invalid" })
})

app_tokenstate.get('/status', (request, response) => {
  logger.info("server_local(/status): requested")
  // request updated token
  tokenStore.getStatus()
    .then(status => response.send(status))
})

app_tokenstate.get('/help', (request, response) => {
  logger.info("server_local(/help): requested")
  // request help to see available commands
  response.json({ "status": {"description" : "general status update including valid test and expire dates", "query":"none" },
    "token" : {"description": "retrieve token as is - or grab valid - or force upate", "query": "none, valid, update"},
    "refresh" : {"description": "send refresh token as is - or force refresh update", "query": "none, update"} })
})

// used as a response to /token?valid
async function getValidToken(force) {
  // maybe use function here
  // check that if valid then send
  // if not valid then renew and then send
  let token = await tokenStore.getToken()
  if (token.token_valid == "TRUE" && force != "TRUE")
    return token
  else {
    // need to refresh token
    await refreshTokenFromRefresh()
    return await tokenStore.getToken()
  }
}

async function refreshTokenFromRefresh() {
  let refreshT = await tokenStore.getRefreshToken()
  let newT = await tokenAccess.getTokenFromRefresh(refreshT.refresh_token)
  await tokenStore.insertToken(newT)
}

async function forceRefresh() {
  let refreshT = await tokenStore.getRefreshToken()
  let newT = await tokenAccess.getRefreshFromRefresh(refreshT.refresh_token)
  await tokenStore.insertToken(newT)
  return await tokenStore.getRefreshToken()
}



function startInsideServer() {
  server = app_tokenstate.listen(port, () => {
    console.log(`server_local: started and listening on port ${port}`)
    logger.info(`server_local: started and listening on port ${port}`)
  })
}

function stopInsideServer() {
  server.close(function () {
    logger.info('server_local: Closed');
    tokenStore.stopTokenStore();
    //process.exit();
  })
}


module.exports = { startInsideServer, stopInsideServer }