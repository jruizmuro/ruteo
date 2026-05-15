# Ruteo

Planificador de rutas circulares para runners y ciclistas.  
Define distancia y desnivel → la app genera rutas circulares óptimas con 3 variantes.

## Stack

Nuxt 4 · Vue 3 · TypeScript strict · Nuxt UI v4 · Pinia · Zod · Supabase · MapLibre GL JS · Capacitor v6

## Comandos

```bash
pnpm dev              # servidor de desarrollo
pnpm build            # build de producción
pnpm preview          # preview del build local
pnpm lint             # ESLint + tsc --noEmit
pnpm test:unit        # Vitest (una vez)
pnpm test:coverage    # Vitest + informe de cobertura
pnpm test:e2e         # Playwright (requiere build previo)
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

Consulta cada sección comentada para saber en qué fase del roadmap se necesita cada variable.

## Roadmap de fases

| Fase | Descripción                                         |
| ---- | --------------------------------------------------- |
| 0    | Bootstrap (este PR)                                 |
| 1    | Schemas Zod + tipos compartidos                     |
| 2    | `useCapacitor` adapter + Auth Supabase              |
| 3    | Mapa MapLibre + Generador de rutas (feature núcleo) |
| 4    | Persistencia Supabase + Exportar GPX/KML            |
| 5    | SEO + PWA + i18n                                    |
| 6    | Capacitor + Android                                 |
| 7    | iOS + Codemagic                                     |
| 8    | Tracking GPS background + offline avanzado          |
| 9    | Observabilidad + lanzamiento en tiendas             |

## Reglas de contribución

- Sin `any` en TypeScript (error de ESLint)
- Sin `console.log` en código fuente (check en CI)
- Mínimo 3 casos de test por archivo nuevo
- Cobertura ≥ 80 % (umbral en Vitest)
- Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`)
