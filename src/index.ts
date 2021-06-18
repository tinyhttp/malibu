import { serialize, SerializeOptions } from "@tinyhttp/cookie";
import { Request, Response, NextFunction } from "@tinyhttp/app";
import { sign } from "@tinyhttp/cookie-signature";
import { Tokens } from "./token";

declare module "@tinyhttp/app" {
  interface Request {
    csrfToken(): string;
  }
}

// HTTP Method according to MDN (https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "OPTIONS"
  | "HEAD"
  | "TRACE";

/**
 * Options for CSRF constructor.
 * Refer to README for more information.
 */
export interface CSRFOptions {
  cookie?: CookieOptions;
  sessionKey?: string;
  value?: (req: Request) => any;
  ignoreMethod?: Array<HTTPMethod>;
  saltLength?: number;
  secretLength?: number;
}

/**
 * Options for cookie value.
 * Extends SerializeOptions from @tinyhttp/cookie.
 */
export type CookieOptions = SerializeOptions & {
  signed?: boolean;
  key?: string;
  path?: string;
};

const defaultOptions: CSRFOptions = {
  cookie: { signed: false, key: "_csrf", path: "/" },
  sessionKey: "session",
  ignoreMethod: ["GET", "HEAD", "OPTIONS"],
  saltLength: 8,
  secretLength: 18,
  value: defaultValue,
};

/**
 * Initiate CSRF (Cross-Site Request Forgery) Protection middleware.
 * @function csrf
 * @param {CSRFOptions} opts Given configuration options
 * @returns {RouterHandler} CSRF Protection Middleware
 * @example
 * const csrfProtection = csrf()
 * app.use(cookieParser())
 *
 * app.get("/", csrfProtection, (req, res) => {
 *   res.status(200).json({ token: req.csrfToken() });
 * });
 */
export function csrf(opts: CSRFOptions = {}) {
  const options = Object.assign({}, defaultOptions, opts);

  if (!options.cookie?.key) options.cookie.key = "_csrf";
  if (!options.cookie?.path) options.cookie.path = "/";

  const tokens = new Tokens({
    saltLength: options.saltLength,
    secretLength: options.secretLength,
  });

  return (req: Request, res: Response, next: NextFunction) => {
    if (!verifyConfiguration(req, options.sessionKey, options.cookie)) {
      throw new Error("misconfigured csrf");
    }

    let secret = getSecret(req, options.sessionKey, options.cookie);
    let token: string;

    req.csrfToken = (): string => {
      let newSecret = !options.cookie
        ? getSecret(req, options.sessionKey, options.cookie)
        : secret;

      if (token && newSecret === secret) {
        return token;
      }

      if (newSecret === undefined) {
        newSecret = tokens.secret();
        setSecret(req, res, options.sessionKey, newSecret, options.cookie);
      }

      token = tokens.create(newSecret);
      return token;
    };

    if (!secret) {
      secret = tokens.secret();
      setSecret(req, res, options.sessionKey, secret, options.cookie);
    }

    if (
      !options.ignoreMethod.includes(req.method as HTTPMethod) &&
      !tokens.verify(secret, options.value(req))
    ) {
      return res.status(403).send("invalid csrf token");
    }

    next();
  };
}

function defaultValue(req: Request): string | Array<string> {
  return (
    req.body?._csrf ||
    req.query?._csrf ||
    req.headers["csrf-token"] ||
    req.headers["xsrf-token"] ||
    req.headers["x-csrf-token"] ||
    req.headers["x-xsrf-token"]
  );
}

function verifyConfiguration(
  req: Request,
  sessionKey: string,
  cookie: CookieOptions
): boolean {
  if (!getSecretBag(req, sessionKey, cookie)) {
    return false;
  }

  if (cookie?.signed && !req?.secret) {
    return false;
  }

  return true;
}

function getSecret(
  req: Request,
  sessionKey: string,
  cookie: CookieOptions
): string {
  const bag = getSecretBag(req, sessionKey, cookie);
  if (!bag) {
    throw new Error("misconfigured csrf");
  }

  return bag[cookie.key];
}

function getSecretBag(
  req: Request,
  sessionKey: string,
  cookie: CookieOptions
): string {
  if (cookie) {
    return cookie.signed ? req?.signedCookies : req?.cookies;
  }
  return req[sessionKey];
}

function setSecret(
  req: Request,
  res: Response,
  sessionKey: string,
  secret: string,
  cookie: CookieOptions
): void {
  if (cookie) {
    const value = cookie.signed
      ? `s:${sign(secret, req.secret as string)}`
      : secret;
    setCookie(res, cookie.key, value, cookie);
    return;
  }

  req[sessionKey].csrfSecret = secret;
}

function setCookie(
  res: Response,
  name: string,
  secret: string,
  cookie: CookieOptions
): void {
  const data = serialize(name, secret, cookie);
  const previousHeader = (res.getHeader("set-cookie") as Array<string>) ?? [];
  res.setHeader(
    "set-cookie",
    Array.isArray(previousHeader)
      ? previousHeader.concat(data)
      : [previousHeader, data]
  );
}
