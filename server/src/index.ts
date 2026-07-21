import 'dotenv/config'
import app from './app.js'
import { env } from './config/env.js'
import { verifySmtp } from './utils/email.js'

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  verifySmtp()
})
