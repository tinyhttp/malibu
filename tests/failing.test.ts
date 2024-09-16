import { App, type Request } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { urlencoded } from 'milliparsec'
import { makeFetch } from 'supertest-fetch'
import { assert, describe, it } from 'vitest'
import { onTestFinished } from 'vitest'
import { csrf } from '../src/index'
import type { CSRFRequest } from '../src/index'

describe('failing - these should return error', () => {
  it('without a cookie parser', async () => {
    const app = new App<Request & CSRFRequest, any>()
    const csrfProtection = csrf({ cookie: { signed: false } })
    app.use('/', urlencoded(), csrfProtection, (req, res) => {
      res.status(200).json({ token: req.csrfToken() })
    })
    const server = app.listen()
    onTestFinished(() => {
      server.close()
    })

    const fetch = makeFetch(server)

    const response = await fetch('/')
    const body = await response.text()

    assert.equal(response.status, 500)
    assert.equal(body, 'misconfigured csrf')
  })

  it('signed but without a secret', async () => {
    const app = new App<Request & CSRFRequest, any>()
    app.use(cookieParser())
    const csrfProtection = csrf({ cookie: { signed: true } })
    app.use('/', urlencoded(), csrfProtection, (req, res) => {
      res.status(200).json({ token: req.csrfToken() })
    })
    const server = app.listen()
    onTestFinished(() => {
      server.close()
    })

    const fetch = makeFetch(server)

    const response = await fetch('/')
    const body = await response.text()

    assert.equal(response.status, 500)
    assert.equal(body, 'misconfigured csrf')
  })

  it('session without the session middleware', async () => {
    const app = new App<Request & CSRFRequest, any>()
    const csrfProtection = csrf({ middleware: 'session' })
    app.use('/', urlencoded(), csrfProtection, (req, res) => {
      res.status(200).json({ token: req.csrfToken() })
    })
    const server = app.listen()
    onTestFinished(() => {
      server.close()
    })

    const fetch = makeFetch(server)

    const response = await fetch('/')
    const body = await response.text()

    assert.equal(response.status, 500)
    assert.equal(body, 'misconfigured csrf')
  })
})
