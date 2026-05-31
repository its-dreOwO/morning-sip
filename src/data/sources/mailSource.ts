// MOCK. Replace with Gmail API later — return the same MailData shape.
export interface MailData { unread: number; urgent: number; senders: string[]; }

export function getMockMail(): MailData {
  return { unread: 12, urgent: 2, senders: ["Sam", "GitHub", "Stripe"] };
}
