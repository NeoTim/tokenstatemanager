const request = require('request')
const config = require('./config');

const accessurl = config.tdameritradeAPI.accessurl
const clientid = config.tdameritradeAPI.clientid
const redirect_uri = config.tdameritradeAPI.redirect_uri
/*
* On website developer.tdameritrade.com/authentication/apis/post/token-0
* body parameters are not encoded....the website will encode and then post
* similar that request will encode as required
*
* bad grant will show up as: { error: 'invalid_grant' }
*/

async function getRefreshFromRefresh(refreshT) {
    return new Promise(function (resolve, reject) {
        const param = { headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
            grant_type: "refresh_token", refresh_token: refreshT, access_type: "offline", client_id: clientid }
        request.post({ url: accessurl, json: true, form: param }, (error, response) => {
            if (error) {
                reject(error)
            } else {
                resolve(response.body)
            }
        })
    })
}

async function getTokenFromRefresh(refreshT) {
    return new Promise(function (resolve, reject) {
        const param = { headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
            grant_type: "refresh_token", refresh_token: refreshT, client_id: clientid }
        request.post({ url: accessurl, json: true, form: param }, (error, response) => {
            if (error) {
                reject(error)
            } else {
                resolve(response.body)
            }
        })
    })
}


async function getTokenFromCode(codeT) {
    return new Promise(function (resolve, reject) {
        const param = { headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
            grant_type: "authorization_code", code: codeT, access_type: "offline", client_id: clientid, redirect_uri: redirect_uri }
        request.post({ url: accessurl, json: true, form: param }, (error, response) => {
            if (error) {
                reject(error)
            } else {
                resolve(response.body)
            }
        })
    })
}

module.exports = { getTokenFromCode, getTokenFromRefresh, getRefreshFromRefresh }