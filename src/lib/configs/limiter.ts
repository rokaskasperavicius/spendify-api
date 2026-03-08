import rateLimit from 'express-rate-limit'

const rateLimiterOptions = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  limit: 60, // Limit each IP to 100 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export { rateLimiterOptions }
