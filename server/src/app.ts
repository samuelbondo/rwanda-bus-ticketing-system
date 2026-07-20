import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import { join } from 'path'
import { env } from './config/env.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { notFound } from './middlewares/notFound.js'

const swaggerDoc = YAML.load(join(process.cwd(), '../docs/api/openapi.yaml'))

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import busRoutes from './routes/bus.routes.js'
import routeRoutes from './routes/route.routes.js'
import scheduleRoutes from './routes/schedule.routes.js'
import seatRoutes from './routes/seat.routes.js'
import bookingRoutes from './routes/booking.routes.js'
import verifyRoutes from './routes/verify.routes.js'
import reportRoutes from './routes/report.routes.js'
import auditRoutes from './routes/audit.routes.js'

import uploadRoutes from './routes/upload.routes.js'
import slideshowRoutes from './routes/slideshow.routes.js'

const app = express()

app.set('trust proxy', 1)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", 'https://api.cloudinary.com'],
      formAction: ["'self'", 'https://api.cloudinary.com'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({ origin: env.CLIENT_URL, credentials: true, exposedHeaders: ['Content-Disposition'] }))
app.use(express.json())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/api/upload'),
  })
)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { customSiteTitle: 'Rwanda Bus API Docs' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/buses', busRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/seats', seatRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/verify', verifyRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/audit-logs', auditRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/slideshow', slideshowRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
