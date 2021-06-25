<div align="center">
<br /><br />
<img align="center" width="600px" src="https://raw.githubusercontent.com/tinyhttp/malibu/master/logo.svg" alt="Malibu" />
<br /><br />

<!-- badges goes here -->

[![npm](https://img.shields.io/npm/v/malibu?style=for-the-badge&logo=npm&label=&color=#31FFF3)](https://npmjs.com/package/malibu) [![npm](https://img.shields.io/npm/dt/malibu?style=for-the-badge&color=#31FFF3)](https://npmjs.com/package/malibu) [![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tinyhttp/malibu/CI?label=&logo=github&style=for-the-badge&color=#31FFF3)](https://github.com/tinyhttp/malibu/actions) [![Codecov](https://img.shields.io/codecov/c/gh/tinyhttp/malibu?style=for-the-badge&color=#31FFF3)](https://app.codecov.io/gh/tinyhttp/malibu)

</div>

This middleware helps web developers fight [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) attacks. Bear in mind, by solely using this middleware, we can't guarantee your app will be free from CSRF attacks. Refer to [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) and [pillarjs/understanding-csrf](https://github.com/pillarjs/understanding-csrf) for more details.

## Install

```
pnpm i malibu
```

## Usage

Like all CSRF plugins, it depends on either Cookie Parser or Session middleware.

```js
import { App } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { csrf } from 'malibu'

const app = new App()

const csrfProtection = csrf()
app.use(cookieParser())

// this lets you acquire CSRF token on response body
// you also have CSRF token on your cookies as _csrf
app.get('/', csrfProtection, (req, res) => {
  res.status(200).json({ token: req.csrfToken() })
})

// you may only access this if you give a previously acquired CSRF token
app.post('/', csrfProtection, (req, res) => {
  res.status(200).json({ message: 'hello' })
})
```

For signed cookies:

```js
const app = new App()

const csrfProtection = csrf({ cookie: { signed: true } })
app.use(cookieParser('secret key'))

// this lets you acquire CSRF token on the response body
// you also have a CSRF token on your cookies as _csrf
app.get('/', csrfProtection, (req, res) => {
  res.status(200).json({ token: req.csrfToken() })
})

// you may only access this if you give a previously acquired CSRF token
app.post('/', csrfProtection, (req, res) => {
  res.status(200).json({ message: 'hello' })
})
```

For working with [express-session](https://github.com/expressjs/session):

```js
import { App } from '@tinyhttp/app'
import session from 'express-session'
import { csrf } from 'malibu'

const app = new App()

const csrfProtection = csrf({ middleware: 'session' })
app.use(session({ secret: 'secret key', resave: false, saveUninitialized: false }))

// this lets you acquire CSRF token on response body
app.get('/', csrfProtection, (req, res) => {
  res.status(200).json({ token: req.csrfToken() })
})

// you may only access this if you give a previously acquired CSRF token
app.post('/', csrfProtection, (req, res) => {
  res.status(200).json({ message: 'hello' })
})
```

For other framework appliances, please refer to [examples](https://github.com/tinyhttp/malibu/tree/master/examples)

## Options

| Name         | Type                    | Default                                                                                                                                           | Description                                                                                                                                                                                                                                                                                    |
| ------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| middleware   | `string`                | `cookie`                                                                                                                                          | Specifies which middleware to look for. Available options are `cookie` and `session`                                                                                                                                                                                                           |
| cookie       | `CookieOptions`         | `{ signed: false, key: '_csrf', path: '/' }`                                                                                                      | `signed` specifies whether the cookie is signed or unsigned, `key` specifies to the cookie key, `path` specifies the domain of the cookie. For other options please refer to [@tinyhttp/cookie serializer options](https://github.com/tinyhttp/tinyhttp/tree/master/packages/cookie#options-1) |
| sessionKey   | `string`                | `session`                                                                                                                                         | Specifies session key name                                                                                                                                                                                                                                                                     |
| value        | `(req: Request) => any` | `req.body._csrf, req.query._csrf, req.headers["csrf-token"], req.headers["xsrf-token"], req.headers["x-csrf-token"], req.headers["x-xsrf-token"]` | Specifies where to look for the CSRF token                                                                                                                                                                                                                                                     |
| ignoreMethod | `Array<HTTPMethod>`     | `["GET", "HEAD", "OPTIONS"]`                                                                                                                      | Specifies the HTTP Method in which CSRF protection will be disabled                                                                                                                                                                                                                            |
| saltLength   | `number`                | `8`                                                                                                                                               | Specifies the salt length for CSRF token                                                                                                                                                                                                                                                       |
| secretLength | `number`                | `18`                                                                                                                                              | Specifies the secret length for CSRF Token                                                                                                                                                                                                                                                     |

## Why "malibu"?

It's one variation of a longboard used in surfing. It's a 60's style longboard, made with heavy glass, long parallel 50/50 rails, and a deep single fin. Made especially for trimming, (walking the board) and for noseriding. Not to mention, it looks cool.
