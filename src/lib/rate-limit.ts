import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

const _limiters = new Map<string, Ratelimit>()
function getLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string): Ratelimit {
  let instance = _limiters.get(prefix)
  if (!instance) {
    instance = new Ratelimit({
      redis: getRedis(),
      limiter,
      prefix,
      analytics: true,
    })
    _limiters.set(prefix, instance)
  }
  return instance
}

/** Admin login — 5 attempts per 15 minutes per IP */
export const loginRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(5, '15 m'), 'rl:login'), p) }
})

/** OTP send — 3 sends per 5 minutes per identifier */
export const otpSendRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(3, '5 m'), 'rl:otp:send'), p) }
})

/** OTP verify — 5 attempts per 10 minutes per identifier */
export const otpVerifyRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(5, '10 m'), 'rl:otp:verify'), p) }
})

/** Public contact form — 3 submissions per hour per IP */
export const contactRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(3, '1 h'), 'rl:contact'), p) }
})

/** Cart inquiry — 5 submissions per hour per IP */
export const cartRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(5, '1 h'), 'rl:cart'), p) }
})

/** Public API search — 60 requests per minute per IP */
export const searchRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(60, '1 m'), 'rl:search'), p) }
})

/** Sample request — 5 submissions per hour per IP */
export const sampleRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(5, '1 h'), 'rl:sample'), p) }
})

/** Product request — 5 submissions per hour per IP */
export const productRequestRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(5, '1 h'), 'rl:product-request'), p) }
})

/** Generic API rate limit — 100 requests per minute per IP */
export const apiRateLimit = new Proxy({} as Ratelimit, {
  get(_, p) { return Reflect.get(getLimiter(Ratelimit.slidingWindow(100, '1 m'), 'rl:api'), p) }
})
