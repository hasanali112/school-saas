export interface DatabaseConfig {
  url: string;
  /** NOLOGIN BYPASSRLS role the app switches to for pre-auth and provider callbacks. */
  systemRole: string;
}
