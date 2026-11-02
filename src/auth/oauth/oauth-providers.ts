// Google, X and Facebook sign-in: what each provider needs for the
// authorization-code flow, and how its profile maps to ours.

export type OAuthProvider = 'google' | 'x' | 'facebook';

export const OAUTH_PROVIDERS: OAuthProvider[] = ['google', 'x', 'facebook'];

export type OAuthProfile = {
  provider: OAuthProvider;
  /** The provider's stable user id. */
  subject: string;
  email: string | null;
  /** True only when the provider says the person controls this email. */
  emailVerified: boolean;
  name: string | null;
};

type TokenResponse = { access_token?: string; error?: string; error_description?: string };

type ProviderSpec = {
  idEnv: string;
  secretEnv: string;
  authorizeUrl: string;
  scope: string;
  /** X requires PKCE; Google supports it. Facebook's web flow uses the secret. */
  pkce: boolean;
  extraAuthorizeParams?: Record<string, string>;
  exchange: (args: { code: string; clientId: string; clientSecret: string; redirectUri: string; verifier: string }) => Promise<string>;
  profile: (accessToken: string) => Promise<OAuthProfile>;
};

const TIMEOUT_MS = 15_000;

async function getJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  const text = await response.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { error: text.slice(0, 200) };
  }
  if (!response.ok) {
    const detail = (body as TokenResponse).error_description || (body as TokenResponse).error || `HTTP ${response.status}`;
    throw new Error(`${new URL(url).host}: ${detail}`);
  }
  return body as T;
}

function requireToken(body: TokenResponse): string {
  if (!body.access_token) throw new Error(body.error_description || body.error || 'No access token');
  return body.access_token;
}

const FACEBOOK_GRAPH = 'https://graph.facebook.com/v19.0';

export const PROVIDER_SPECS: Record<OAuthProvider, ProviderSpec> = {
  google: {
    idEnv: 'GOOGLE_CLIENT_ID',
    secretEnv: 'GOOGLE_CLIENT_SECRET',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    pkce: true,
    extraAuthorizeParams: { prompt: 'select_account' },
    exchange: async ({ code, clientId, clientSecret, redirectUri, verifier }) =>
      requireToken(
        await getJson<TokenResponse>('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code_verifier: verifier,
          }),
        }),
      ),
    profile: async (accessToken) => {
      const me = await getJson<{ sub?: string; email?: string; email_verified?: boolean; name?: string }>(
        'https://openidconnect.googleapis.com/v1/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!me.sub) throw new Error('Google returned no user id');
      return {
        provider: 'google',
        subject: me.sub,
        email: me.email || null,
        emailVerified: Boolean(me.email && me.email_verified === true),
        name: me.name || null,
      };
    },
  },

  x: {
    idEnv: 'X_CLIENT_ID',
    secretEnv: 'X_CLIENT_SECRET',
    authorizeUrl: 'https://x.com/i/oauth2/authorize',
    // users.email lets X share the account's confirmed email, if the app has
    // that permission; without it X shares no email at all.
    scope: 'users.read tweet.read users.email',
    pkce: true,
    exchange: async ({ code, clientId, clientSecret, redirectUri, verifier }) =>
      requireToken(
        await getJson<TokenResponse>('https://api.x.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
            client_id: clientId,
          }),
        }),
      ),
    profile: async (accessToken) => {
      const me = await getJson<{ data?: { id?: string; name?: string; confirmed_email?: string } }>(
        'https://api.x.com/2/users/me?user.fields=confirmed_email',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!me.data?.id) throw new Error('X returned no user id');
      const email = me.data.confirmed_email || null;
      return { provider: 'x', subject: me.data.id, email, emailVerified: Boolean(email), name: me.data.name || null };
    },
  },

  facebook: {
    idEnv: 'FACEBOOK_APP_ID',
    secretEnv: 'FACEBOOK_APP_SECRET',
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    scope: 'email,public_profile',
    pkce: false,
    exchange: async ({ code, clientId, clientSecret, redirectUri }) =>
      requireToken(
        await getJson<TokenResponse>(
          `${FACEBOOK_GRAPH}/oauth/access_token?${new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          })}`,
        ),
      ),
    profile: async (accessToken) => {
      const me = await getJson<{ id?: string; name?: string; email?: string }>(
        `${FACEBOOK_GRAPH}/me?${new URLSearchParams({ fields: 'id,name,email', access_token: accessToken })}`,
      );
      if (!me.id) throw new Error('Facebook returned no user id');
      // Facebook only returns an email it has confirmed for the account.
      const email = me.email || null;
      return { provider: 'facebook', subject: me.id, email, emailVerified: Boolean(email), name: me.name || null };
    },
  },
};
