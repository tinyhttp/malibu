import cookieParser from 'cookie-parser'
import polka from 'polka'
import { json } from 'milliparsec'
import { csrf } from '../../src/index'

const app = polka()

app.use(cookieParser())
const csrfProtection = csrf()

// @ts-ignore
app.get('/', json(), csrfProtection, (req, res) => {
  res.statusCode = 200
  res.setHeader('content-type', 'application/json')
  // @ts-ignore
  res.end(JSON.stringify({ token: req.csrfToken() }))
})

// @ts-ignore
app.post('/', json(), csrfProtection, (_, res) => {
  res.statusCode = 200
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify({ message: 'hello there' }))
})

app.listen(5000, () => console.log('listening on http://localhost:5000'))
