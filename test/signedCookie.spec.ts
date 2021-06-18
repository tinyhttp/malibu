import { suite } from "uvu";
import * as assert from "uvu/assert";
import { CSRFOptions } from "../src";
import { initApp } from "./helper";

const signedOutput = suite("signed cookie - output");

signedOutput("should output a csrf token", async () => {
  const { fetch } = initApp({ middleware: "signedCookie" });
  const response = await fetch("/");
  const body = await response.json();

  assert.is(response.status, 200);
  assert.ok(response.headers.has("set-cookie"));
  assert.ok(response.headers.get("set-cookie").startsWith("_csrf="));
  assert.type(body.token, "string");
});

signedOutput(
  "should output a csrf token with given options (different salt & secret length)",
  async () => {
    const options: CSRFOptions = {
      saltLength: 10,
      secretLength: 30,
    };
    const { fetch } = initApp({ middleware: "signedCookie", options });
    const response = await fetch("/");
    const body = await response.json();

    const [salt, _] = body.token.split("-");
    assert.is(response.status, 200);
    assert.is(salt.length, 10);
  }
);

signedOutput(
  "should output a csrf token with given options (different cookie path)",
  async () => {
    const options: CSRFOptions = {
      cookie: {
        path: "/admin",
        key: "virus",
      },
    };
    const { fetch } = initApp({ middleware: "signedCookie", options });
    const response = await fetch("/");
    const body = await response.json();

    const [token, path] = response.headers.get("set-cookie").split(" ");

    assert.is(response.status, 200);
    assert.ok(response.headers.has("set-cookie"));
    assert.ok(token.startsWith("virus"));
    assert.is(path.split("Path=")[1], "/admin");
    assert.type(body.token, "string");
  }
);

signedOutput.run();

const signedBody = suite("signed cookie - req.body");

signedBody("should be able to pass through req.body", async () => {
  const { fetch } = initApp({ middleware: "signedCookie", parser: "json" });
  const request = await fetch("/");
  const requestBody = await request.json();

  const response = await fetch("/", {
    method: "post",
    body: JSON.stringify({ _csrf: requestBody.token }),
    headers: {
      cookie: request.headers.get("set-cookie"),
    },
  });
  const body = await response.json();

  assert.is(response.status, 200);
  assert.is(body.message, "hello");
});

signedBody("should not be able to pass through req.body", async () => {
  const { fetch } = initApp({ middleware: "signedCookie", parser: "json" });
  const request = await fetch("/");
  const requestBody = await request.json();

  const response = await fetch("/", {
    method: "post",
    body: JSON.stringify({}),
    headers: {
      cookie: request.headers.get("set-cookie"),
    },
  });
  const body = await response.text();

  assert.is(response.status, 403);
  assert.is(body, "invalid csrf token");
});

signedBody.run();

const signedQuery = suite("signed cookie - req.query");

signedQuery("should be able to pass through query", async () => {
  const { fetch } = initApp({ middleware: "signedCookie" });
  const request = await fetch("/");
  const requestBody = await request.json();

  const response = await fetch(
    `/?_csrf=${encodeURIComponent(requestBody.token)}`,
    {
      method: "post",
      headers: {
        cookie: request.headers.get("set-cookie"),
      },
    }
  );
  const body = await response.json();

  assert.is(response.status, 200);
  assert.is(body.message, "hello");
});

signedQuery.run();

const signedHeader = suite("signed cookie - req.headers");

signedHeader("should be able to pass through headers csrf-token", async () => {
  const { fetch } = initApp({ middleware: "signedCookie" });
  const request = await fetch("/");
  const requestBody = await request.json();

  const response = await fetch(`/`, {
    method: "post",
    headers: {
      cookie: request.headers.get("set-cookie"),
      "csrf-token": requestBody.token,
    },
  });

  const body = await response.json();

  assert.is(response.status, 200);
  assert.is(body.message, "hello");
});

signedHeader("should be able to pass through headers xsrf-token", async () => {
  const { fetch } = initApp({ middleware: "signedCookie" });
  const request = await fetch("/");
  const requestBody = await request.json();

  const response = await fetch(`/`, {
    method: "post",
    headers: {
      cookie: request.headers.get("set-cookie"),
      "xsrf-token": requestBody.token,
    },
  });

  const body = await response.json();

  assert.is(response.status, 200);
  assert.is(body.message, "hello");
});

signedHeader(
  "should be able to pass through headers x-csrf-token",
  async () => {
    const { fetch } = initApp({ middleware: "signedCookie" });
    const request = await fetch("/");
    const requestBody = await request.json();

    const response = await fetch(`/`, {
      method: "post",
      headers: {
        cookie: request.headers.get("set-cookie"),
        "x-csrf-token": requestBody.token,
      },
    });

    const body = await response.json();

    assert.is(response.status, 200);
    assert.is(body.message, "hello");
  }
);

signedHeader(
  "should be able to pass through headers x-xsrf-token",
  async () => {
    const { fetch } = initApp({ middleware: "signedCookie" });
    const request = await fetch("/");
    const requestBody = await request.json();

    const response = await fetch(`/`, {
      method: "post",
      headers: {
        cookie: request.headers.get("set-cookie"),
        "x-xsrf-token": requestBody.token,
      },
    });

    const body = await response.json();

    assert.is(response.status, 200);
    assert.is(body.message, "hello");
  }
);

signedHeader.run();
