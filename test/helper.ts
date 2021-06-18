import { randomBytes } from "crypto";
import { makeFetch } from "supertest-fetch";
import { App } from "@tinyhttp/app";
import { cookieParser } from "@tinyhttp/cookie-parser";
import { json, urlencoded } from "milliparsec";
import { csrf, CSRFOptions } from "../src/index";

type ParserOptions = "urlencoded" | "json";
type MiddlewareOptions = "cookie" | "signedCookie" | "session";

interface initAppOptions {
  middleware?: MiddlewareOptions;
  parser?: ParserOptions;
  options?: CSRFOptions;
}

const secret = randomBytes(32).toString("base64");

export function initApp({
  parser = "urlencoded",
  options = {},
  middleware = "cookie",
}: initAppOptions) {
  const app = new App();
  const csrfProtection = csrf(parseOptions(options, middleware));

  if (parser === "urlencoded") {
    app.use(urlencoded());
  } else if (parser === "json") {
    app.use(json());
  }

  if (middleware === "cookie") {
    app.use(cookieParser());
  } else if (middleware === "signedCookie") {
    app.use(cookieParser(secret));
  } else if (middleware === "session") {
    throw new Error("session is not available yet at this point of time");
  }

  app.get("/", csrfProtection, (req, res) => {
    res.status(200).json({ token: req.csrfToken() });
  });
  app.post("/", csrfProtection, (req, res) => {
    res.status(200).json({ message: "hello" });
  });

  const server = app.listen();
  const fetch = makeFetch(server);

  return { fetch, app, server };
}

function parseOptions(options: CSRFOptions, middleware: MiddlewareOptions) {
  if (Object.keys(options).length === 0 && middleware === "signedCookie") {
    return { cookie: { signed: true } };
  }
  return options;
}
