import cookieParser from 'cookie-parser'
import e, { Request, Response } from 'express'
import { csrf, CSRFRequest } from '../src'

const app = e()

app.use(cookieParser())
app.use(e.json())
app.use(e.urlencoded({ extended: true }))

const csrfProtection = csrf()

// @ts-ignore
app.get('/', csrfProtection, (req: Request & CSRFRequest, res: Response) => {
  res.status(200).json({ token: req.csrfToken() })
})

// @ts-ignore
app.post('/', csrfProtection, (_, res) => {
  res.status(200).json({ message: 'hello' })
})

app.listen(5000, () => console.log('listening on http://localhost:5000'))
