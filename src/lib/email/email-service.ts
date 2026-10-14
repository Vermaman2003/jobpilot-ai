/**
 * JobPilot AI — Email Integration & Response Tracking Service
 * 
 * Non-Negotiable Rules:
 * 1. Read-only access principle: never sends emails or replies automatically.
 * 2. Classifies application outcomes: Confirmation, Recruiter reply, Interview, Offer, Rejection.
 * 3. Extracts confidence score and concrete supporting evidence text snippets.
 * 4. Never assumes silence means rejection.
 * 5. Provides manual verification workflow: user confirms/corrects classifications.
 * 6. Includes mock email dataset for offline development and instant demonstration.
 */

import { Application, EmailClassificationType, ProcessedEmail } from '@/types';

export interface EmailMessageInput {
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  dateReceived: string;
  body: string;
}

export class EmailService {
  /**
   * Deterministic pattern rules for classifying email bodies and subjects.
   */
  public static classifyEmail(
    email: EmailMessageInput,
    trackedApplications: Application[] = []
  ): {
    classification: EmailClassificationType;
    confidence: number;
    matchedCompany?: string;
    matchedJobTitle?: string;
    associatedApplicationId?: string;
    evidence: string[];
  } {
    const text = `${email.subject} \n ${email.body}`.toLowerCase();
    const evidence: string[] = [];

    // Attempt to match with tracked applications by company name
    let matchedApp: Application | undefined;
    for (const app of trackedApplications) {
      if (text.includes(app.job.company.toLowerCase())) {
        matchedApp = app;
        evidence.push(`Matched tracked company name: "${app.job.company}"`);
        break;
      }
    }

    // 1. Offer Detection
    if (
      text.includes('offer letter') ||
      text.includes('pleased to offer') ||
      text.includes('congratulations on your offer') ||
      text.includes('offer of employment')
    ) {
      evidence.push('Contains explicit employment offer phrasing.');
      return {
        classification: 'OFFER',
        confidence: 0.95,
        matchedCompany: matchedApp?.job.company,
        matchedJobTitle: matchedApp?.job.title,
        associatedApplicationId: matchedApp?.id,
        evidence,
      };
    }

    // 2. Interview Invitation Detection
    if (
      text.includes('invite you to interview') ||
      text.includes('invitation to interview') ||
      text.includes('schedule an interview') ||
      text.includes('technical screen') ||
      text.includes('next steps in our interview process') ||
      text.includes('phone screen') ||
      text.includes('calendly.com') ||
      text.includes('schedule a call')
    ) {
      evidence.push('Contains interview scheduling request or calendar link.');
      return {
        classification: 'INTERVIEW_INVITATION',
        confidence: 0.9,
        matchedCompany: matchedApp?.job.company,
        matchedJobTitle: matchedApp?.job.title,
        associatedApplicationId: matchedApp?.id,
        evidence,
      };
    }

    // 3. Rejection Detection
    if (
      text.includes('pursue other candidates') ||
      text.includes('decided to move forward with other candidates') ||
      text.includes('not moving forward') ||
      text.includes('at this time, we have decided') ||
      text.includes('will not be moving forward') ||
      text.includes('unfortunate to inform you')
    ) {
      evidence.push('Contains standard candidate non-selection or closure language.');
      return {
        classification: 'REJECTION',
        confidence: 0.88,
        matchedCompany: matchedApp?.job.company,
        matchedJobTitle: matchedApp?.job.title,
        associatedApplicationId: matchedApp?.id,
        evidence,
      };
    }

    // 4. Application Confirmation Detection
    if (
      text.includes('thank you for applying') ||
      text.includes('application has been received') ||
      text.includes('we received your application') ||
      text.includes('confirmation of your application') ||
      text.includes('application submitted')
    ) {
      evidence.push('Contains formal application receipt confirmation.');
      return {
        classification: 'APPLICATION_CONFIRMATION',
        confidence: 0.92,
        matchedCompany: matchedApp?.job.company,
        matchedJobTitle: matchedApp?.job.title,
        associatedApplicationId: matchedApp?.id,
        evidence,
      };
    }

    // 5. Recruiter Outreach
    if (
      text.includes('recruiter') ||
      text.includes('talent acquisition') ||
      text.includes('impressed by your background') ||
      text.includes('would love to connect')
    ) {
      evidence.push('Contains direct recruiter talent acquisition outreach.');
      return {
        classification: 'RECRUITER_OUTREACH',
        confidence: 0.75,
        matchedCompany: matchedApp?.job.company,
        matchedJobTitle: matchedApp?.job.title,
        associatedApplicationId: matchedApp?.id,
        evidence,
      };
    }

    // Default to unmatched
    return {
      classification: 'UNMATCHED',
      confidence: 0.3,
      associatedApplicationId: matchedApp?.id,
      evidence: ['No definitive recruitment status keywords detected.'],
    };
  }

  /**
   * Mock inbox fixture representing real emails for immediate demonstration without requiring OAuth credentials.
   */
  public static getMockInbox(trackedApplications: Application[] = []): ProcessedEmail[] {
    const rawMockEmails: EmailMessageInput[] = [
      {
        messageId: 'gmail_msg_001',
        threadId: 'th_001',
        sender: 'careers@stripe.com',
        subject: 'Thank you for applying to Stripe — Full Stack Engineer',
        dateReceived: new Date(Date.now() - 3600000 * 2).toISOString(),
        body: 'Hi Candidate, Thank you for applying to the Full Stack Engineer role at Stripe. We have received your application and our recruitment team is currently reviewing your background.',
      },
      {
        messageId: 'gmail_msg_002',
        threadId: 'th_002',
        sender: 'recruiting@airbnb.com',
        subject: 'Airbnb Engineering — Invitation to Technical Screen',
        dateReceived: new Date(Date.now() - 3600000 * 24).toISOString(),
        body: 'Hi Candidate, Our hiring team was impressed by your profile. We would like to invite you to an initial 45-minute technical screen. Please schedule a time that works best for you here: https://calendly.com/airbnb-screen/candidate.',
      },
      {
        messageId: 'gmail_msg_003',
        threadId: 'th_003',
        sender: 'no-reply@figma.com',
        subject: 'Update regarding your application at Figma',
        dateReceived: new Date(Date.now() - 3600000 * 48).toISOString(),
        body: 'Thank you for taking the time to speak with our engineering team. After careful review, we have decided to move forward with other candidates whose experience more closely matches our current needs.',
      },
      {
        messageId: 'gmail_msg_004',
        threadId: 'th_004',
        sender: 'talent@dropbox.com',
        subject: 'Dropbox — Formal Offer of Employment',
        dateReceived: new Date(Date.now() - 3600000 * 72).toISOString(),
        body: 'Congratulations! We are thrilled to offer you the position of Software Engineer at Dropbox. Attached you will find the formal offer letter outlining compensation, equity, and start date details.',
      },
    ];

    return rawMockEmails.map((msg) => {
      const classification = this.classifyEmail(msg, trackedApplications);
      return {
        id: `email_${msg.messageId}`,
        messageId: msg.messageId,
        threadId: msg.threadId,
        sender: msg.sender,
        subject: msg.subject,
        dateReceived: msg.dateReceived,
        snippet: msg.body.slice(0, 160) + '...',
        classification: classification.classification,
        confidence: classification.confidence,
        matchedCompany: classification.matchedCompany,
        matchedJobTitle: classification.matchedJobTitle,
        associatedApplicationId: classification.associatedApplicationId,
        evidence: classification.evidence,
        isUserVerified: false,
      };
    });
  }
}
