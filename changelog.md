# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Ideas
- keep more tokens than just one API TD Ameritrade
- could allow multi user type approach to store other's token - like a vault

### ToDo's
- auto refresh option on server to maintain a persistent valid token
- redirect added back to status page after receiving redirect with code from oauth server
- added checks on get requests to make sure there is only one query returned
- possible to create for multi-users or switch direction to handle multiple API tokens

## [0.1.1] - 2020-04-06
### Changed
- tokenStore.js changed single connection into pooled connection
- cleaned up log messages on OutsideSecureServer.js
- cleaned up comments

## [0.1.0] - 2020-04-05
### Added
- Initial commit of token server
- Created API to manage stored tokens and refresh tokens
- API also fetches and refreshes both token and refresh
- outside server runs to grab code to request initial token from an oauth type server
- inside server runs to access tokens directly and request and refreshes