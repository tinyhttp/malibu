import { suite } from "uvu";
import * as assert from "uvu/assert";
import { initApp } from "./helper";

const signedOutput = suite("unsigned cookie - output");

signedOutput("should output a csrf token", async () => {
  const { fetch } = initApp({ middleware: "cookie" });
  const response = await fetch("/");
  const body = await response.json();

  assert.is(response.status, 200);
  assert.ok(response.headers.has("set-cookie"));
  assert.ok(response.headers.get("set-cookie").startsWith("_csrf="));
  assert.type(body.token, "string");
});

signedOutput.run();

const signedBody = suite("unsigned cookie - req.body");

signedBody("should be able to pass through req.body", async () => {
  const { fetch } = initApp({ middleware: "cookie", parser: "json" });
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
  const { fetch } = initApp({ middleware: "cookie", parser: "json" });
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

const signedQuery = suite("unsigned cookie - req.query");
signedQuery("should be able to pass through query", async () => {
  const { fetch } = initApp({ middleware: "cookie" });
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

const signedHeader = suite("unsigned cookie - req.headers");

signedHeader("should be able to pass through headers csrf-token", async () => {
  const { fetch } = initApp({ middleware: "cookie" });
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
  const { fetch } = initApp({ middleware: "cookie" });
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
    const { fetch } = initApp({ middleware: "cookie" });
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
    const { fetch } = initApp({ middleware: "cookie" });
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
