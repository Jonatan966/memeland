/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORKER_URL: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
  readonly VITE_GITHUB_REDIRECT_URL: string;
  readonly VITE_GITHUB_STATE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
