import { assert, describe, it } from 'vitest'
import { onTestFinished } from 'vitest'
import type { CSRFOptions } from '../src/index'
import { initApp } from './helper'

describe('signed cookie - output', () => {
  it('should output a csrf token', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })

    const response = await fetch('/')
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.ok(response.headers.has('set-cookie'))
    assert.ok(response.headers.get('set-cookie')?.startsWith('_csrf=s%3A'))
    assert.typeOf(body.token, 'string')
  })

  it('should output a csrf token with given options (different salt & secret length)', async () => {
    const options: CSRFOptions = {
      saltLength: 10,
      secretLength: 30,
      cookie: {
        signed: true
      }
    }
    const { fetch, server } = initApp({ middleware: 'signedCookie', options })
    onTestFinished(() => {
      server.close()
    })

    const response = await fetch('/')
    const body = await response.json()

    const [salt, _] = body.token.split('-')
    assert.equal(response.status, 200)
    assert.equal(salt.length, 10)
  })

  it('should output a csrf token with given options (different cookie path)', async () => {
    const options: CSRFOptions = {
      cookie: {
        signed: true,
        path: '/admin',
        key: 'virus'
      }
    }
    const { fetch, server } = initApp({ middleware: 'signedCookie', options })
    onTestFinished(() => {
      server.close()
    })

    const response = await fetch('/')
    const body = await response.json()

    const [token, path] = response.headers.get('set-cookie')?.split(' ') ?? ['', '']

    assert.equal(response.status, 200)
    assert.ok(response.headers.has('set-cookie'))
    assert.ok(token.startsWith('virus'))
    assert.equal(path.split('Path=')[1], '/admin')
    assert.typeOf(body.token, 'string')
  })
})

describe('signed cookie - req.body', () => {
  it('should be able to pass through req.body', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie', parser: 'json' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    const response = await fetch('/', {
      method: 'post',
      body: JSON.stringify({ _csrf: requestBody.token }),
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'content-type': 'application/json'
      }
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.message, 'hello')
  })

  it('should not be able to pass through req.body', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie', parser: 'json' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')

    const response = await fetch('/', {
      method: 'post',
      body: JSON.stringify({}),
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'content-type': 'application/json'
      }
    })
    const body = await response.text()

    assert.equal(response.status, 403)
    assert.equal(body, 'invalid csrf token')
  })
})

describe('signed cookie - req.query', () => {
  it('should be able to pass through query', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    const response = await fetch(`/?_csrf=${encodeURIComponent(requestBody.token)}`, {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.message, 'hello')
  })
})

describe('signed cookie - req.headers', () => {
  it('should be able to pass through headers csrf-token', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    const response = await fetch('/', {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'csrf-token': requestBody.token
      }
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.message, 'hello')
  })

  it('should be able to pass through headers xsrf-token', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    const response = await fetch('/', {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'xsrf-token': requestBody.token
      }
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.message, 'hello')
  })

  it('should be able to pass through headers x-csrf-token', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    const response = await fetch('/', {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'x-csrf-token': requestBody.token
      }
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.message, 'hello')
  })

  it('should be able to pass through headers x-xsrf-token', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    const response = await fetch('/', {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'x-xsrf-token': requestBody.token
      }
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.message, 'hello')
  })
})

describe('reusable token', () => {
  it('a', async () => {
    const { fetch, server } = initApp({ middleware: 'signedCookie' })
    onTestFinished(() => {
      server.close()
    })
    const request = await fetch('/')
    const requestBody = await request.json()

    // response #1
    const response1 = await fetch('/', {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'x-xsrf-token': requestBody.token
      }
    })
    const body1 = await response1.json()

    // response #2
    const response2 = await fetch('/', {
      method: 'post',
      headers: {
        cookie: request.headers.get('set-cookie') ?? '',
        'x-xsrf-token': requestBody.token
      }
    })
    const body2 = await response2.json()

    assert.equal(response1.status, 200)
    assert.equal(response2.status, 200)
    assert.equal(body1.message, 'hello')
    assert.equal(body2.message, 'hello')
  })
})
