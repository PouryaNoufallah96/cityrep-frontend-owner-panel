/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_OAUTH_KEY: string
    readonly VITE_APPLICATION_ID: string
    readonly VITE_CLIENT_ID: string
    readonly VITE_CLIENT_SECRET: string
    readonly VITE_BASE_API: string
    readonly VITE_BASE_HUB: string
    readonly VITE_TOKEN_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
