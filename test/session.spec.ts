import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import type { CSRFOptions } from '../src/index'
import { initApp } from './helper'

const options: CSRFOptions = {
  middleware: 'session'
}

const output = suite('session - output')

output('should output a csrf token', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const response = await fetch('/')
  const body = await response.json()

  assert.is(response.status, 200)
  assert.ok(response.headers.has('set-cookie'))
  assert.type(body.token, 'string')
})

output('should output a csrf token with given options (different salt & secret length)', async () => {
  const saltySecret: CSRFOptions = {
    saltLength: 10,
    secretLength: 30
  }
  const { fetch } = initApp({ middleware: 'session', options: { ...options, ...saltySecret } })
  const response = await fetch('/')
  const body = await response.json()

  const [salt, _] = body.token.split('-')
  assert.is(response.status, 200)
  assert.is(salt.length, 10)
})

output.run()

const body = suite('session - req.body')

body('should be able to pass through req.body', async () => {
  const { fetch } = initApp({ middleware: 'session', parser: 'json', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  const response = await fetch('/', {
    method: 'post',
    body: JSON.stringify({ _csrf: requestBody.token, hello: 'there' }),
    headers: {
      cookie: request.headers.get('set-cookie'),
      'content-type': 'application/json'
    }
  })
  const body = await response.json()

  assert.is(response.status, 200)
  assert.is(body.message, 'hello')
})

body('should not be able to pass through req.body', async () => {
  const { fetch } = initApp({ middleware: 'session', parser: 'json', options })
  const request = await fetch('/')

  const response = await fetch('/', {
    timeout: 5000,
    method: 'post',
    body: '{}',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'content-type': 'application/json'
    }
  })
  const body = await response.text()

  assert.is(response.status, 403)
  assert.is(body, 'invalid csrf token')
})

body.run()

const query = suite('session - req.query')

query('should be able to pass through query', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  const response = await fetch(`/?_csrf=${encodeURIComponent(requestBody.token)}`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'content-type': 'application/x-www-form-urlencoded'
    }
  })
  const body = await response.json()

  assert.is(response.status, 200)
  assert.is(body.message, 'hello')
})

query.run()

const header = suite('session - req.headers')

header('should be able to pass through headers csrf-token', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  const response = await fetch(`/`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'csrf-token': requestBody.token
    }
  })

  const body = await response.json()

  assert.is(response.status, 200)
  assert.is(body.message, 'hello')
})

header('should be able to pass through headers xsrf-token', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  const response = await fetch(`/`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'xsrf-token': requestBody.token
    }
  })

  const body = await response.json()

  assert.is(response.status, 200)
  assert.is(body.message, 'hello')
})

header('should be able to pass through headers x-csrf-token', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  const response = await fetch(`/`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'x-csrf-token': requestBody.token
    }
  })

  const body = await response.json()

  assert.is(response.status, 200)
  assert.is(body.message, 'hello')
})

header('should be able to pass through headers x-xsrf-token', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  const response = await fetch(`/`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'x-xsrf-token': requestBody.token
    }
  })

  const body = await response.json()

  assert.is(response.status, 200)
  assert.is(body.message, 'hello')
})

header.run()

const reusable = suite('reusable token')

reusable('a', async () => {
  const { fetch } = initApp({ middleware: 'session', options })
  const request = await fetch('/')
  const requestBody = await request.json()

  // response #1
  const response1 = await fetch(`/`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'x-xsrf-token': requestBody.token
    }
  })

  const body1 = await response1.json()

  // response #2
  const response2 = await fetch(`/`, {
    method: 'post',
    headers: {
      cookie: request.headers.get('set-cookie'),
      'x-xsrf-token': requestBody.token
    }
  })

  const body2 = await response2.json()

  assert.is(response1.status, 200)
  assert.is(response2.status, 200)
  assert.equal(body1.message, 'hello')
  assert.equal(body2.message, 'hello')
})

reusable.run()
