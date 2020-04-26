
/*
outsideSecureServer
running 3001 listening port for API to access token
  * /status - shows - token valid, expire, last updated, refresh exists, server running - also link to renew entire token
  * /code - capture code from outside and redirect user to log in for credentials
*/

const express = require('express')
const https = require('https') // for secure server on 3000
const fs = require('fs') // to grab certificates and key
const app_receivecode = express() // app set up for outside access, go grab status and store code after oauth2
const tokenAccess = require('./tdapi_client') // client to form requests to external API
const localauth = require('./check_localauth')  // I'm the only user so its my auth to access outside server
const logger = require("./logger").Logger // quick and simple logger setup
const tokenStore = require("./tokenStore") // data layer
const config = require('./config')
const port_secure = config.app.outsidePort

// key and certificate for https on 3000
let cert = fs.readFileSync(__dirname + '/../.certs/selfsigned.crt')
let key = fs.readFileSync(__dirname + '/../.certs/selfsigned.key')
var options = {
  key: key,
  cert: cert
}

app_receivecode.get('/', (request, response) => {
  logger.info("Server_secure(/): requested")
  if (request.query.code) {
    tokenAccess.getTokenFromCode(request.query.code).then(function (access_token) {
      logger.info("Server_secure(/): access_token received")
      tokenStore.insertToken(access_token)
      response.send("Code to Token update completed")
      //TODO: add redirect back to status instead
    })
  }
  else {
    logger.error("Server_secure(/): error sent")
    response.status(401).send('Not Authorized');
  }
})

app_receivecode.get('/status', (request, response) => {
  logger.info(`Server_secure(/status): requested : query ${JSON.stringify(request.query)}`)
  if (localauth.auth(request.query.authcode)) {
    tokenStore.getStatus()
      .then(status => response.send(status_html(request.query.authcode, status)))
  }
  else {
    logger.error("Server_secure(/status): error sent")
    response.status(401).send('Not Authorized');
  }
})

function status_html(authcode, status) {
  const htmlstring = "<H2>Status of Token State Manager</H2> " +
  `<p>Status: ${JSON.stringify(status)}</p>` +
  `<p><a href="${config.tdameritradeAPI.authurl}?client_id=${encodeURIComponent(config.tdameritradeAPI.clientid)}` +
  `&response_type=code&redirect_uri=${encodeURIComponent(config.tdameritradeAPI.redirect_uri)}">` +
  `Use New Code</a></p>`
  return htmlstring
}


let server_receivecode = https.createServer(options, app_receivecode)

function startOutsideServer() {
  server_receivecode.listen(port_secure, (err) => {
    if (err) {
      logger.err('Server_secure: something bad happened', err)
      return err
    }
    console.log(`Server_secure: started and listening on ${port_secure}`)
    logger.info(`Server_secure: started and listening on ${port_secure}`)
  })
}

function stopOutsideServer() {
  server_receivecode.close(function () {
    logger.info('Server_secure: Closed');
    //tokenStore.stopTokenStore();
    //process.exit();
  })
}




module.exports = { startOutsideServer, stopOutsideServer }