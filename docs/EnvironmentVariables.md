## Environment Variables

### Authentication and Security

- **`NEXTAUTH_URL`**: Base URL for authentication. Example: `http://localhost:4002`.
- **`NEXTAUTH_SECRET`**: Secret key for signing authentication tokens.
- **`SMTP_HOST`**: SMTP server host for email notifications.
- **`SMTP_PORT`**: SMTP server port.
- **`SMTP_USER`**: Username for SMTP authentication.
- **`SMTP_PASSWORD`**: Password for SMTP authentication.
- **`SMTP_FROM`**: Default "from" address for emails.
- **`DATABASE_URL`**: URL for the PostgreSQL database. Format: `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>`.
- **`GROUP_PREFIX`**: Prefix for SSO group identifiers. Default: `unifie-`.
- **`CONFIRM_EMAIL`**: (boolean) Require users to confirm their email before accessing features. Default: `false`.
- **`DISABLE_NON_BUSINESS_EMAIL_SIGNUP`**: (boolean) Disable signups using non-business email addresses. Default: `false`.

### External Integrations

- **`SVIX_URL`**: Base URL for the Svix API.
- **`SVIX_API_KEY`**: API key for Svix.
- **`GITHUB_CLIENT_ID`** and **`GITHUB_CLIENT_SECRET`**: GitHub OAuth credentials.
- **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`**: Google OAuth credentials.
- **`RETRACED_URL`**: URL for the Retraced API.
- **`RETRACED_API_KEY`** and **`RETRACED_PROJECT_ID`**: API credentials for Retraced.
- **`NEXT_PUBLIC_MIXPANEL_TOKEN`**: Token for Mixpanel analytics.

### Branding and UI

- **`NEXT_PUBLIC_TERMS_URL`**: URL for terms and conditions. Default: `/terms`.
- **`NEXT_PUBLIC_PRIVACY_URL`**: URL for privacy policy. Default: `/privacy`.
- **`NEXT_PUBLIC_DARK_MODE`**: (boolean) Enable dark mode for the UI. Default: `false`.
- **`NEXT_PUBLIC_SUPPORT_URL`**: URL for customer support.
- **`BRANDING_PROJECT_NAME`**: Name of the branded project. Default: `Unifie-store`.

### Feature Toggles

- **`HIDE_LANDING_PAGE`**: (boolean) Hide the landing page and redirect to the login page. Default: `true`.
- **`NEXT_PUBLIC_UNIFIE_SHOW_PODS`**: (boolean) Show pod details. Default: `true`.
- **`NEXT_PUBLIC_UNIFIE_SHOW_AVAILABILITY`**: (boolean) Show availability details. Default: `true`.
- **`NEXT_PUBLIC_UNIFIE_SHOW_METRICS`**: (boolean) Show metrics. Default: `true`.
- **`NEXT_PUBLIC_UNIFIE_SUBSCRIPTION_REQUIRED`**: (boolean) Require a subscription for usage. Default: `true`.
- **`FEATURE_TEAM_*`**: Toggles for team-related features such as `SSO`, `DSYNC`, `AUDIT_LOG`, etc.

### Observability

- **`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`**: OpenTelemetry metrics endpoint.
- **`OTEL_EXPORTER_OTLP_METRICS_HEADERS`**: Headers for OpenTelemetry metrics.
- **`OTEL_PREFIX`**: Prefix for OpenTelemetry metrics. Default: `unifie.saas`.

### Error Monitoring

- **`NEXT_PUBLIC_SENTRY_DSN`**: Data source name for Sentry integration.
- **`NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE`**: Sampling rate for Sentry tracing. Default: `0.0`.
- **`SENTRY_RELEASE`** and **`SENTRY_ENVIRONMENT`**: Release and environment identifiers for Sentry.

### Notifications

- **`SLACK_WEBHOOK_URL`**: Slack webhook URL for notifications.

### Payment Processing

- **`STRIPE_SECRET_KEY`**: Secret key for Stripe payments.
- **`STRIPE_WEBHOOK_SECRET`**: Webhook secret for Stripe.

### Captcha

- **`RECAPTCHA_SITE_KEY`**: Site key for Google reCAPTCHA.
- **`RECAPTCHA_SECRET_KEY`**: Secret key for Google reCAPTCHA.
