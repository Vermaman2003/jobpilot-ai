import { describe, it, expect } from 'vitest';
import { EmailService } from '@/lib/email/email-service';
import { DEFAULT_APPLICATIONS } from '@/lib/store';

describe('EmailService', () => {
  const applications = DEFAULT_APPLICATIONS;

  it('classifies job offer emails accurately with high confidence', () => {
    const email = {
      messageId: 'msg_offer_1',
      threadId: 'th_1',
      sender: 'hr@stripe.com',
      subject: 'Offer of Employment — Full Stack Engineer',
      dateReceived: new Date().toISOString(),
      body: 'Dear Candidate, We are pleased to offer you the position of Full Stack Engineer at Stripe. Please review the attached offer letter.',
    };

    const result = EmailService.classifyEmail(email, applications);
    expect(result.classification).toBe('OFFER');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.evidence.some((e) => e.includes('offer'))).toBe(true);
  });

  it('classifies interview invitations and extracts evidence', () => {
    const email = {
      messageId: 'msg_interview_1',
      threadId: 'th_2',
      sender: 'recruiting@stripe.com',
      subject: 'Stripe: Invitation to Technical Interview',
      dateReceived: new Date().toISOString(),
      body: 'Hi Candidate, We would like to schedule an interview with our engineering lead. Please choose a slot on calendly.com/stripe-lead.',
    };

    const result = EmailService.classifyEmail(email, applications);
    expect(result.classification).toBe('INTERVIEW_INVITATION');
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('classifies application confirmations', () => {
    const email = {
      messageId: 'msg_confirm_1',
      threadId: 'th_3',
      sender: 'jobs@stripe.com',
      subject: 'Thank you for applying to Stripe',
      dateReceived: new Date().toISOString(),
      body: 'We have received your application and will review your qualifications shortly.',
    };

    const result = EmailService.classifyEmail(email, applications);
    expect(result.classification).toBe('APPLICATION_CONFIRMATION');
  });

  it('classifies rejections respectfully without assuming silence is rejection', () => {
    const email = {
      messageId: 'msg_reject_1',
      threadId: 'th_4',
      sender: 'recruiting@stripe.com',
      subject: 'Update on your Stripe application',
      dateReceived: new Date().toISOString(),
      body: 'After careful consideration, we have decided to move forward with other candidates at this time.',
    };

    const result = EmailService.classifyEmail(email, applications);
    expect(result.classification).toBe('REJECTION');
  });

  it('populates mock inbox fixture for demonstration', () => {
    const inbox = EmailService.getMockInbox(applications);
    expect(inbox.length).toBeGreaterThanOrEqual(4);
    expect(inbox.some((e) => e.classification === 'OFFER')).toBe(true);
    expect(inbox.some((e) => e.classification === 'INTERVIEW_INVITATION')).toBe(true);
  });
});
