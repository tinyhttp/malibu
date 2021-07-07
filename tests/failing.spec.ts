import { makeFetch } from 'supertest-fetch'
import { App, Request } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { urlencoded } from 'milliparsec'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { csrf } from '../src/index'
import type { CSRFRequest } from '../src/index'

const failing = suite('failing - these should return error')

failing('without a cookie parser', async () => {
  const app = new App<any, Request & CSRFRequest>()
  const csrfProtection = csrf({ cookie: { signed: false } })
  app.use('/', urlencoded(), csrfProtection, (req, res) => {
    res.status(200).json({ token: req.csrfToken() })
  })
  const server = app.listen()

  const fetch = makeFetch(server)

  const response = await fetch('/')
  const body = await response.text()

  assert.is(response.status, 500)
  assert.is(body, 'misconfigured csrf')
})

failing('signed but without a secret', async () => {
  const app = new App<any, Request & CSRFRequest>()
  app.use(cookieParser())
  const csrfProtection = csrf({ cookie: { signed: true } })
  app.use('/', urlencoded(), csrfProtection, (req, res) => {
    res.status(200).json({ token: req.csrfToken() })
  })
  const server = app.listen()

  const fetch = makeFetch(server)

  const response = await fetch('/')
  const body = await response.text()

  assert.is(response.status, 500)
  assert.is(body, 'misconfigured csrf')
})

failing('session without the session middleware', async () => {
  const app = new App<any, Request & CSRFRequest>()
  const csrfProtection = csrf({ middleware: 'session' })
  app.use('/', urlencoded(), csrfProtection, (req, res) => {
    res.status(200).json({ token: req.csrfToken() })
  })
  const server = app.listen()

  const fetch = makeFetch(server)

  const response = await fetch('/')
  const body = await response.text()

  assert.is(response.status, 500)
  assert.is(body, 'misconfigured csrf')
})

failing.run()
