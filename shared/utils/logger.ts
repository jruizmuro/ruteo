export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  readonly [key: string]: unknown
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
}

interface LoggerOptions {
  readonly level?: LogLevel
  readonly sink?: LogSink
}

export type LogSink = (level: LogLevel, message: string, context?: LogContext) => void

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const defaultSink: LogSink = (level, message, context) => {
  const payload = context ? { message, ...context } : { message }
  // eslint-disable-next-line no-console
  const fn = level === 'debug' || level === 'info' ? console.log : console[level]
  fn(`[${level}]`, payload)
}

const resolveDefaultLevel = (): LogLevel => {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env
  if (env?.NODE_ENV === 'production') return 'warn'
  return 'debug'
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? resolveDefaultLevel()
  const sink = options.sink ?? defaultSink
  const threshold = LEVEL_ORDER[level]

  const emit = (entryLevel: LogLevel, message: string, context?: LogContext): void => {
    if (LEVEL_ORDER[entryLevel] < threshold) return
    sink(entryLevel, message, context)
  }

  return {
    debug: (message, context) => emit('debug', message, context),
    info: (message, context) => emit('info', message, context),
    warn: (message, context) => emit('warn', message, context),
    error: (message, context) => emit('error', message, context),
  }
}

export const logger: Logger = createLogger()
