# Ruteo — Planificador de rutas circulares para runners y ciclistas

App móvil nativa (iOS + Android vía Capacitor) y PWA web.
El usuario define distancia y desnivel → la app genera rutas circulares óptimas.

## Stack
- **Framework**: Nuxt 4, Vue 3 `<script setup lang="ts">`, TypeScript strict
- **UI**: Nuxt UI v4 + Tailwind CSS v4
- **Estado**: Pinia (stores tipadas)
- **Fechas**: Dayjs
- **Móvil**: Capacitor v6 (@capacitor/geolocation, filesystem, share, haptics)
- **Mapa**: MapLibre GL JS v4 + OpenFreeMap (sin coste)
- **Geo API**: OpenRouteService (proxy en server/api para ocultar key)
- **Validación**: Zod (schemas = source of truth → tipos inferidos automáticamente)
- **Backend**: Supabase (PostgreSQL + PostGIS + Auth + Storage + RLS activo)
- **Testing**: Vitest + @vue/test-utils + Playwright + MSW v2
- **CI/CD**: GitHub Actions (web + Android) + Codemagic (iOS, 500 min gratis/mes)
- **Deploy web**: Vercel

## Comandos esenciales
```bash
pnpm dev              # desarrollo web
pnpm build            # build web (output en .output/public)
npx cap sync          # sincronizar build → ios/ y android/
pnpm test:unit        # Vitest
pnpm test:e2e         # Playwright
pnpm lint             # ESLint + tsc --noEmit
```

## Arquitectura — ver detalles completos
@.claude/arquitectura.md
@.claude/stack.md
@.claude/mobile.md
@.claude/cicd.md
@.claude/seo-features.md

## Reglas IMPORTANTES — YOU MUST seguirlas siempre

- NUNCA usar `any` en TypeScript. Si no sabes el tipo, usa `unknown` y nárrálo.
- NUNCA importar `$fetch` o plugins de Capacitor directamente en composables.
  Recíbelos como parámetro o usa el composable `useCapacitor()` como Adapter.
- NUNCA saltarse validación Zod en server routes. Todo input validado.
- SIEMPRE escribir mínimo 3 casos de test por archivo nuevo (Vitest).
- SIEMPRE usar `useCapacitor()` para acceder a GPS, filesystem o share.
  Nunca llamar a Capacitor Plugins directamente desde componentes.
- SIEMPRE añadir nota si el código difiere entre plataforma web y nativa.
- NUNCA hacer `console.log` en producción. Usa el logger tipado de `shared/utils/logger.ts`.
- NUNCA refactorizar código no relacionado con la tarea. Solo toca lo pedido.
- Al crear un composable nuevo: SRP — una sola responsabilidad.
- Al crear schemas Zod: van en `shared/schemas/`. Los tipos se infieren con `z.infer<>`.

## Git — REGLAS ESTRICTAS
- NUNCA ejecutar `git add`, `git commit`, `git push` ni ningún comando git.
- Cuando el código esté listo para commitear, avisar con un mensaje claro:
  > "✋ Listo para commit. Archivos modificados: X, Y, Z. Ejecútalo tú cuando quieras."
- NUNCA sugerir ni escribir comandos git en el chat salvo que el usuario los pida explícitamente.

## Principios SOLID (resumen rápido)
- **S**: Un composable = una responsabilidad
- **O**: Nuevos perfiles de transporte → nuevo enum, sin tocar useRouteGenerator
- **L**: useCapacitor implementa ILocationProvider → intercambiable en tests
- **I**: Interfaces pequeñas: IRoute, IRouteStats, IRouteFilters
- **D**: Dependencias como parámetros, nunca importadas directamente

## Estructura clave
```
app/composables/useCapacitor.ts   ← Adapter nativo/web (GPS, share, filesystem)
app/composables/useRouteGenerator.ts
shared/schemas/index.ts           ← Zod schemas (source of truth de tipos)
server/api/routes/generate.post.ts ← Proxy ORS con validación Zod
capacitor.config.ts               ← appId: com.ruteo.app
codemagic.yaml                    ← Build iOS en cloud (macOS M2)
```
