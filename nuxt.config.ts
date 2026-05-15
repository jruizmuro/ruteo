import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },

  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'dayjs-nuxt',
    '@nuxtjs/i18n',
  ],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    orsApiKey: process.env['ORS_API_KEY'] ?? '',
    supabaseServiceKey: process.env['SUPABASE_SERVICE_KEY'] ?? '',
    public: {
      supabaseUrl: process.env['SUPABASE_URL'] ?? '',
      supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] ?? '',
    },
  },

  i18n: {
    defaultLocale: 'es',
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    strategy: 'no_prefix',
    bundle: {
      optimizeTranslationDirective: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Ruteo',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#000000' },
      ],
    },
  },
})
