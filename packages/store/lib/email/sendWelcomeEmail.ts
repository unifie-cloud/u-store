import { render } from '@react-email/components';
import { sendEmail } from './sendEmail';
import { WelcomeEmail } from '@/components/emailTemplates';
import env from '../env';

export const sendWelcomeEmail = async (
  name: string,
  email: string,
  team: string
) => {
  const subject = `Welcome to ${env.branding.PROJECT_NAME}!`;
  const html = await render(WelcomeEmail({ name, team, subject }));

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
