/** Why a TMDb request failed, in the terms a screen needs to word its message. */
export type TmdbErrorKind =
  // The token is missing, or TMDb rejects it
  | 'unauthorized'
  | 'notFound'
  | 'rateLimited'
  // The device is offline, or the connection failed before TMDb answered
  | 'network'
  // TMDb answered with a server error, or with anything else the app can't act on
  | 'server';

export class TmdbError extends Error {
  constructor(
    readonly kind: TmdbErrorKind,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'TmdbError';
  }
}
