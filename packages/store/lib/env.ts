import type { SessionStrategy } from 'next-auth';

const env = {
  databaseUrl: `${process.env.DATABASE_URL}`,
  appUrl: `${process.env.APP_URL}`,
  appApiUrl: `${process.env.APP_URL}/api`,
  redirectIfAuthenticated: '/dashboard',

  // SMTP configuration for NextAuth
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },

  // NextAuth configuration
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET,
    sessionStrategy: (process.env.NEXTAUTH_SESSION_STRATEGY ||
      'jwt') as SessionStrategy,
  },

  // Svix
  svix: {
    url: `${process.env.SVIX_URL}`,
    apiKey: `${process.env.SVIX_API_KEY}`,
  },

  //Social login: Github
  github: {
    clientId: `${process.env.GITHUB_CLIENT_ID}`,
    clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
  },

  //Social login: Google
  google: {
    clientId: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
  },

  // Retraced configuration
  retraced: {
    url: process.env.RETRACED_URL
      ? `${process.env.RETRACED_URL}/auditlog`
      : undefined,
    apiKey: process.env.RETRACED_API_KEY,
    projectId: process.env.RETRACED_PROJECT_ID,
  },

  groupPrefix: process.env.GROUP_PREFIX,

  // SAML Jackson configuration
  jackson: {
    url: process.env.JACKSON_URL,
    externalUrl: process.env.JACKSON_EXTERNAL_URL || process.env.JACKSON_URL,
    apiKey: process.env.JACKSON_API_KEY,
    productId: process.env.JACKSON_PRODUCT_ID || 'boxyhq',
    selfHosted: process.env.JACKSON_URL !== undefined,
    sso: {
      callback: `${process.env.APP_URL}`,
      issuer: 'https://saml.boxyhq.com',
      path: '/api/oauth/saml',
      oidcPath: '/api/oauth/oidc',
      idpLoginPath: '/auth/idp-login',
    },
    dsync: {
      webhook_url: `${process.env.APP_URL}/api/webhooks/dsync`,
      webhook_secret: process.env.JACKSON_WEBHOOK_SECRET,
    },
  },

  // Users will need to confirm their email before accessing the app feature
  confirmEmail: process.env.CONFIRM_EMAIL === 'true',

  // Mixpanel configuration
  mixpanel: {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  disableNonBusinessEmailSignup:
    process.env.DISABLE_NON_BUSINESS_EMAIL_SIGNUP === 'true',

  authProviders: process.env.AUTH_PROVIDERS || 'github,credentials',

  otel: {
    prefix: process.env.OTEL_PREFIX || 'unifie.store',
  },

  hideLandingPage: process.env.HIDE_LANDING_PAGE === 'true',

  darkModeEnabled: process.env.NEXT_PUBLIC_DARK_MODE === 'true',

  teamFeatures: {
    sso: process.env.FEATURE_TEAM_SSO === 'true',
    dsync: process.env.FEATURE_TEAM_DSYNC === 'true',
    webhook: process.env.FEATURE_TEAM_WEBHOOK === 'true',
    apiKey: process.env.FEATURE_TEAM_API_KEY === 'true',
    auditLog: process.env.FEATURE_TEAM_AUDIT_LOG === 'true',
    payments:
      process.env.FEATURE_TEAM_PAYMENTS === 'false'
        ? false
        : Boolean(
            process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
          ),
    deleteTeam: process.env.FEATURE_TEAM_DELETION === 'true',
  },

  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY || null,
    secretKey: process.env.RECAPTCHA_SECRET_KEY || null,
  },

  maxLoginAttempts: Number(process.env.MAX_LOGIN_ATTEMPTS) || 5,

  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  unifie: {
    /**
     * Comma separated list of cluster IDs that are allowed to access the store.
     * If empty, all clusters are allowed.
     * If not empty, only the clusters in the list are allowed.
     * Example: "1,2,3"
     * Default: ""
     */
    clusterWhitelist: (process.env.UNIFIE_CLUSTER_WHITELIST || '')
      .replace(/[^0-9,]/, '')
      .split(','),
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
    defaultTemplateId: process.env.UNIFIE_DEFAULT_TEMPLATE_ID,
    showPods: process.env.UNIFIE_SHOW_PODS !== 'false',
    showAvailability: process.env.UNIFIE_SHOW_AVAILABILITY !== 'false',
    showMetrics: process.env.UNIFIE_SHOW_METRICS !== 'false',
    subscriptionRequired: process.env.UNIFIE_SUBSCRIPTION_REQUIRED === 'true',
    test: process.env,
  },

  branding: {
    PROJECT_NAME: process.env.BRANDING_PROJECT_NAME || 'Unifie store',
    PROJECT_LOGO:
      process.env.BRANDING_PROJECT_LOGO ||
      'https://api.unifie.cloud/branding/headerLogo.svg',
  },
};

export default env;
