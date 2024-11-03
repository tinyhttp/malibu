import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ParsedUrlQuery } from 'node:querystring'
import { type SerializeOptions, serialize } from '@tinyhttp/cookie'
import { sign } from '@tinyhttp/cookie-signature'
import { Tokens } from './token'

export interface CSRFRequest extends IncomingMessage {
  csrfToken(): string
  secret?: string | string[]
  signedCookies?: Record<string, string>
  cookies?: Record<string, string>
  query?: ParsedUrlQuery
  body?: Record<string, never>
}

// HTTP Method according to MDN (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'TRACE'

type MiddlewareOptions = 'session' | 'cookie'

/**
 * Options for CSRF constructor.
 * Refer to README for more information.
 */
export interface CSRFOptions {
  middleware?: MiddlewareOptions
  cookie?: CookieOptions
  sessionKey?: string
  value?: (req: CSRFRequest | IncomingMessage) => string | string[]
  ignoreMethod?: HTTPMethod[]
  saltLength?: number
  secretLength?: number
}

/**
 * Options for cookie value.
 * Extends SerializeOptions from @tinyhttp/cookie.
 */
export type CookieOptions = SerializeOptions & {
  signed?: boolean
  key?: string
  path?: string
}

const defaultOptions: CSRFOptions = {
  middleware: 'cookie',
  cookie: { signed: false, key: '_csrf', path: '/' },
  sessionKey: 'session',
  ignoreMethod: ['GET', 'HEAD', 'OPTIONS'],
  saltLength: 8,
  secretLength: 18,
  value: defaultValue
}

/**
 * Initiate CSRF (Cross-Site Request Forgery) Protection middleware.
 * @function csrf
 * @param {CSRFOptions} opts Given configuration options
 * @returns {(req: CSRFRequest, res: ServerResponse, next: () => void) => void} CSRF Protection Middleware
 * @example
 * const csrfProtection = csrf()
 * app.use(cookieParser()) // or a session middleware, if you prefer
 *
 * app.get("/", csrfProtection, (req, res) => {
 *   res.status(200).json({ token: req.csrfToken() });
 * });
 */
export function csrf(opts: CSRFOptions = {}): (req: CSRFRequest, res: ServerResponse, next: () => void) => void {
  const options = Object.assign({}, defaultOptions, opts)

  if (!options.cookie?.key) options.cookie.key = '_csrf'
  if (!options.cookie?.path) options.cookie.path = '/'

  const tokens = new Tokens({
    saltLength: options.saltLength,
    secretLength: options.secretLength
  })

  return (req: CSRFRequest, res: ServerResponse, next: () => void) => {
    if (!verifyConfiguration(req, options.sessionKey, options.cookie, options.middleware)) {
      throw new Error('misconfigured csrf')
    }

    let secret: string | undefined = getSecret(req, options.sessionKey, options.cookie, options.middleware)
    let token: string

    req.csrfToken = (): string => {
      const newSecret =
        options.middleware === 'session'
          ? getSecret(req, options.sessionKey, options.cookie, options.middleware)
          : secret

      token = tokens.create(newSecret)
      return token
    }

    if (!secret) {
      secret = tokens.secret()
      setSecret(req, res, options.sessionKey, secret, options.cookie, options.middleware)
    }

    if (!options.ignoreMethod.includes(req.method as HTTPMethod) && !tokens.verify(secret, options.value(req))) {
      return res
        .writeHead(403, 'invalid csrf token', { 'Content-Type': 'text/plain' })
        .end('invalid csrf token', 'utf8')
    }

    next()
  }
}

function defaultValue(req: CSRFRequest): string | string[] {
  return (
    (req?.body?._csrf as string) ||
    req.query?._csrf ||
    req.headers['csrf-token'] ||
    req.headers['xsrf-token'] ||
    req.headers['x-csrf-token'] ||
    req.headers['x-xsrf-token']
  )
}

function verifyConfiguration(
  req: CSRFRequest,
  sessionKey: string,
  cookie: CookieOptions,
  middleware: MiddlewareOptions
): boolean {
  if (!getSecretBag(req, sessionKey, cookie, middleware)) {
    return false
  }

  if (cookie?.signed && !req?.secret) {
    return false
  }

  return true
}

function getSecret(
  req: CSRFRequest,
  sessionKey: string,
  cookie: CookieOptions,
  middleware: MiddlewareOptions
): string | undefined {
  const bag: Record<string, string> | undefined = getSecretBag(req, sessionKey, cookie, middleware)
  const key = middleware === 'cookie' ? cookie.key : 'csrfSecret'

  return bag ? bag[key] : undefined
}

function getSecretBag(
  req: CSRFRequest,
  sessionKey: string,
  cookie: CookieOptions,
  middleware: MiddlewareOptions
): Record<string, string> | undefined {
  if (middleware === 'cookie' && cookie) {
    if (cookie.signed) {
      return req?.signedCookies
    }

    return req?.cookies
  }
  return req[sessionKey]
}

function setSecret(
  req: CSRFRequest,
  res: ServerResponse,
  sessionKey: string,
  secret: string,
  cookie: CookieOptions,
  middleware: MiddlewareOptions
): void {
  if (middleware === 'cookie' && cookie) {
    const value = cookie.signed ? `s:${sign(secret, req.secret as string)}` : secret
    setCookie(res, cookie.key, value, cookie)
    return
  }

  req[sessionKey].csrfSecret = secret
}

function setCookie(res: ServerResponse, name: string, secret: string, cookie: CookieOptions): void {
  const data = serialize(name, secret, cookie)
  const previousHeader = (res.getHeader('set-cookie') as string[]) ?? []
  res.setHeader('set-cookie', Array.isArray(previousHeader) ? previousHeader.concat(data) : [previousHeader, data])
}
