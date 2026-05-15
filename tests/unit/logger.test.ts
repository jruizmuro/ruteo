import { describe, expect, it, vi } from 'vitest'
import { createLogger, type LogSink } from '../../shared/utils/logger'

describe('createLogger', () => {
  it('respeta el umbral de nivel y descarta entradas inferiores', () => {
    const sink: LogSink = vi.fn()
    const log = createLogger({ level: 'warn', sink })

    log.debug('descartado')
    log.info('descartado')
    log.warn('alerta')
    log.error('fallo')

    expect(sink).toHaveBeenCalledTimes(2)
    expect(sink).toHaveBeenNthCalledWith(1, 'warn', 'alerta', undefined)
    expect(sink).toHaveBeenNthCalledWith(2, 'error', 'fallo', undefined)
  })

  it('propaga el contexto al sink', () => {
    const sink: LogSink = vi.fn()
    const log = createLogger({ level: 'debug', sink })

    log.info('hola', { userId: 'u1', requestId: 'r2' })

    expect(sink).toHaveBeenCalledWith('info', 'hola', { userId: 'u1', requestId: 'r2' })
  })

  it('emite los cuatro niveles cuando el umbral es debug', () => {
    const sink: LogSink = vi.fn()
    const log = createLogger({ level: 'debug', sink })

    log.debug('d')
    log.info('i')
    log.warn('w')
    log.error('e')

    expect(sink).toHaveBeenCalledTimes(4)
  })

  it('usa nivel debug por defecto cuando NODE_ENV no es production', () => {
    const sink: LogSink = vi.fn()
    const log = createLogger({ sink })

    log.debug('visible-en-dev')

    expect(sink).toHaveBeenCalledTimes(1)
  })

  it('defaultSink escribe en console — cubre ambos branches de contexto', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const log = createLogger({ level: 'debug' })

    log.debug('sin contexto')
    log.info('con contexto', { traceId: 'abc' })

    expect(consoleSpy).toHaveBeenCalledTimes(2)
    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[debug]', { message: 'sin contexto' })
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[info]', {
      message: 'con contexto',
      traceId: 'abc',
    })
  })

  it('resuelve nivel warn cuando NODE_ENV es production', () => {
    const originalEnv = process.env['NODE_ENV']
    process.env['NODE_ENV'] = 'production'

    const sink: LogSink = vi.fn()
    const log = createLogger({ sink })

    log.info('ignorado en prod')
    log.warn('visible en prod')

    expect(sink).toHaveBeenCalledTimes(1)
    expect(sink).toHaveBeenCalledWith('warn', 'visible en prod', undefined)

    process.env['NODE_ENV'] = originalEnv
  })
})
