import { makeFetch } from 'supertest-fetch'
import { App } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { json, urlencoded } from 'milliparsec'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { csrf, CSRFOptions } from '../src/index'

const failing = suite('failing - these should return error')

failing('without a cookie parser', async () => {
  const app = new App()
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

failing.run()
