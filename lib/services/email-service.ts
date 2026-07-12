import { Resend } from "resend";

import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail(input: SendMailInput) {
  const env = getServerEnv();

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    logger.warn("Email delivery is not configured; message skipped", {
      to: input.to,
      subject: input.subject,
    });
    return { skipped: true };
  }

  const client = new Resend(env.RESEND_API_KEY);

  await client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return { skipped: false };
}
