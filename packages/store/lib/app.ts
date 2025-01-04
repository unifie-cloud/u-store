import packageInfo from '../package.json';
import env from './env';

const app = {
  version: packageInfo.version,
  name: env.branding.PROJECT_NAME,
  logoUrl: env.branding.PROJECT_LOGO,
  url: env.appUrl,
};

export default app;
