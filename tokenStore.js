/*
tokenStore.js
Into and out of mysql:
store tokens
refresh tokens
retrieve tokens 
From oauth2 server
*/
const logger = require("./logger").Logger
const mysql = require('mysql')
const config = require('./config')

const pool = mysql.createPool(config.db)

/*
INSERT INTO `tokenstoredb`.`tokenreceived`
(`id`,`received`,`access_token`,`refresh_token`,`scope`,`expires_in`,`refresh_token_expires_in`,`token_type`)
VALUES
(<{id: }>,<{received: }>,<{access_token: }>,<{refresh_token: }>,<{scope: }>,<{expires_in: }>,
    <{refresh_token_expires_in: }>,<{token_type: }>);
*/

async function insertToken(token) {
  return new Promise((resolve, reject) => {
    //build insert sql
    let sql = "insert into tokenreceived " +
      "(" + to_quotekeys(token) + ") VALUES " +
      "(" + to_quotevalues(token) + ")"

    pool.query(sql, (err, result) => {
        if (err) throw err
        logger.info(`tokenStore: Record Inserted ${result.affectedRows} id:${result.insertId} into tokenreceived`)
        resolve(result)
      })
  })
}

async function getToken() {
  return new Promise((resolve, reject) => {
    const querybuild = `SELECT * from token_table`

    pool.query(querybuild, (err, rows) => {
      if (err) {
        return reject(err)
      }
      logger.info(`tokenStore: Fetch Token`)
      resolve(JSON.parse(JSON.stringify(rows[0])))
    })
  })
}

async function getRefreshToken() {
  return new Promise((resolve, reject) => {
    const querybuild = `SELECT * from refresh_table`

    pool.query(querybuild, (err, rows) => {
      if (err) {
        return reject(err)
      }
      logger.info(`tokenStore: Fetch Refresh Token`)
      resolve(JSON.parse(JSON.stringify(rows[0])))
    })
  })
}

async function getStatus() {
  let tokenstatus = await getToken()
  let refreshstatus = await getRefreshToken()
  //remove actual tokens and add rows
  delete tokenstatus.access_token
  delete tokenstatus.token_type
  delete tokenstatus.scope
  delete refreshstatus.refresh_token
  return Object.assign(tokenstatus, refreshstatus)
}

function to_quotevalues(jsonobject) {
  return "'" + Object.values(jsonobject).join("','") + "'"
}
function to_quotekeys(jsonobject) {
  return "`" + Object.keys(jsonobject).join("`,`") + "`"
}

function stopTokenStore() {
  pool.end((err) => {
    logger.info("tokenStore: stopped MYSQL connection")
  });
}

module.exports = { insertToken, stopTokenStore, getStatus, getToken, getRefreshToken }