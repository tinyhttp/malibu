import { App, Request, Response } from '@tinyhttp/app'
import { cookieParser } from '@tinyhttp/cookie-parser'
import { json } from 'milliparsec'
import { csrf, CSRFRequest } from '../src'

const app = new App<any, Request & CSRFRequest, Response>()

app.use(cookieParser())

const csrfProtection = csrf()

app.get('/', json(), csrfProtection, (req: Request & CSRFRequest, res: Response) => {
  res.status(200).json({ token: req.csrfToken() })
})

app.post('/', json(), csrfProtection, (_, res: Response) => {
  res.status(200).json({ message: 'hello there' })
})

app.listen(5000, () => console.log('listening on http://localhost:5000'))
