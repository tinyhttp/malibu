# @tinyhttp/csrf

<!-- badges goes here -->

> A rewrite of [Express CSURF](https://github.com/expressjs/csurf) library

This middleware helps web developers fight [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) attacks. Bear in mind, by solely using this middleware, we can't guarantee your app will be free from CSRF attacks. Refer to [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) and [pillarjs/understanding-csrf](https://github.com/pillarjs/understanding-csrf) for more details.

## Install

```
pnpm i @tinyhttp/csrf
```

# Usage

Like all CSRF plugin, it depends on either Cookie Parser or Session middleware. As of now (June 2021), @tinyhttp ecosystem doesn't have its' own Session middleware. We'll have to make do with Cookie Parser for now.

```js
import { App } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { csrf } from '@tinyhttp/csrf'
import { json, urlencoded } from 'milliparsec'

const app = new App()

const csrfProtection = csrf()
app.use(cookieParser())

// this lets you acquire CSRF token on response body
// you also have CSRF token on your cookies as _csrf
app.get("/", csrfProtection, (req, res) => {
  res.status(200).json({ token: req.csrfToken() });
});

// you may only access this if you give a previously acquired CSRF token
app.post("/", csrfProtection, (req, res) => {
  res.status(200).json({ message: "hello" });
});
```

For signed cookies:
```js
const app = new App()

const csrfProtection = csrf({ cookie: { signed: true }})
app.use(cookieParser(process.env.COOKIE_SECRET))

// this lets you acquire CSRF token on response body
// you also have CSRF token on your cookies as _csrf
app.get("/", csrfProtection, (req, res) => {
  res.status(200).json({ token: req.csrfToken() });
});

// you may only access this if you give a previously acquired CSRF token
app.post("/", csrfProtection, (req, res) => {
  res.status(200).json({ message: "hello" });
});
```

## Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| cookie | `CookieOptions` | `{ signed: false, key: '_csrf', path: '/' }` | `signed` specifies whether the cookie is signed or unsigned, `key` specifies to the cookie key, `path` specifies the domain of the cookie. Other options please refer to [@tinyhttp/cookie serializer options](https://github.com/tinyhttp/tinyhttp/tree/master/packages/cookie#options-1) |
| sessionKey | `string` | `session` | Specifies session key name |
| value | `(req: Request) => any` | `req.body._csrf, req.query._csrf, req.headers["csrf-token"], req.headers["xsrf-token"], req.headers["x-csrf-token"], req.headers["x-xsrf-token"]` | Specifies where to look for the CSRF token |
| ignoreMethod | `Array<HTTPMethod>` | `["GET", "HEAD", "OPTIONS"]` | Specifies the HTTP Method in which CSRF protection will be disabled |
| saltLength | `number` | `8` | Specifies the salt length for CSRF token |
| secretLength | `number` | `18` | Specifies the secret length for CSRF Token |
