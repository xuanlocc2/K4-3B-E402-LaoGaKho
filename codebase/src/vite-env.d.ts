/// <reference types="vite/client" />

/**
 * Vite environment variable types.
 * Access via: import.meta.env.VITE_*
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // Add more env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
