const config = require('./config');

const authcode = config.app.auth

function auth(invariable) {
    if(invariable == authcode)
        return true
    else 
        return false
}

module.exports = { auth }