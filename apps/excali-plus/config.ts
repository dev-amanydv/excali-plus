const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'production'

export const HTTP_BACKEND =
  isProd ? process.env.NEXT_PUBLIC_HTTP_BACKEND : "http://localhost:8000";
export const WS_URL = isProd ? (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:9000") : "ws://localhost:9000";
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
