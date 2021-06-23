import cookieParser from 'cookie-parser'
import * as polka from 'polka'
import { json } from 'milliparsec'
import { csrf } from '../src/index'

const app = polka()

app.use(cookieParser())
const csrfProtection = csrf()

// @ts-ignore
app.get('/', json(), csrfProtection, (req, res) => {
  // @ts-ignore
  res.json({ token: req.csrfToken() })
})

// @ts-ignore
app.post('/', json(), csrfProtection, (_, res) => {
  res.json({ message: 'hello there' })
})

app.listen(5000, () => console.log('listening on http://localhost:5000'))
