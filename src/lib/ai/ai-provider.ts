/**
 * JobPilot AI — AI Provider Abstraction Layer
 * 
 * Non-Negotiable Tenets:
 * 1. Provider Independence: Works 100% offline via DeterministicProvider, with optional Gemini Flash integration.
 * 2. Strict Truthfulness: Prompts forbid inventing metrics, companies, or tools.
 * 3. Provenance Safeguard: AI outputs are always validated by ClaimProvenanceEngine before acceptance.
 * 4. Zero Hardcoded Secrets: Keys are read from environment variables or user settings.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmailClassificationType } from '@/types';
import { TailoringService } from '../tailoring/tailor-service';
import { EmailService } from '../email/email-service';

export interface AiTailorBulletResult {
  tailoredText: string;
  actionVerb: string;
}

export interface AiCoverLetterParams {
  candidateName: string;
  contactInfo: string;
  jobTitle: string;
  company: string;
  topSkills: string[];
  relevantExperienceSnippet: string;
}

export interface AiEmailClassifyResult {
  classification: EmailClassificationType;
  confidence: number;
  evidence: string[];
}

export interface AiProvider {
  readonly id: string;
  readonly name: string;
  tailorBullet(
    originalBullet: string,
    targetSkills: string[],
    jobContext: { title: string; company: string }
  ): Promise<AiTailorBulletResult>;
  generateCoverLetter(params: AiCoverLetterParams): Promise<string>;
  classifyEmail(
    subject: string,
    body: string,
    trackedCompanies: string[]
  ): Promise<AiEmailClassifyResult>;
  testConnection(): Promise<{ success: boolean; message: string }>;
}

/**
 * 1. Deterministic Rule-Based Provider (Zero Cost, Instant, 100% Offline)
 */
export class DeterministicAiProvider implements AiProvider {
  public readonly id = 'DETERMINISTIC';
  public readonly name = 'Deterministic Rule-Based Engine (Offline)';

  public async tailorBullet(
    originalBullet: string,
    targetSkills: string[]
  ): Promise<AiTailorBulletResult> {
    return TailoringService.enhanceBulletDeterministically(originalBullet, targetSkills);
  }

  public async generateCoverLetter(params: AiCoverLetterParams): Promise<string> {
    return `Dear Hiring Team at ${params.company},

I am writing to express my strong interest in the ${params.jobTitle} position at ${params.company}. Having followed ${params.company}'s work, I am excited about the opportunity to contribute my technical background in ${params.topSkills.join(', ') || 'software engineering'} to your engineering team.

In my recent experience as ${params.relevantExperienceSnippet || 'a Software Engineer'}, I focused on delivering dependable, high-quality software solutions. My work involved designing scalable features, collaborating with cross-functional team members, and ensuring code reliability through thorough testing.

The requirements for the ${params.jobTitle} role closely align with my demonstrated technical capabilities. I am particularly eager to apply my background in ${params.topSkills.slice(0, 3).join(', ') || 'full-stack engineering'} to help ${params.company} advance its mission.

Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications meet the needs of your team.

Sincerely,
${params.candidateName}
${params.contactInfo}`;
  }

  public async classifyEmail(
    subject: string,
    body: string,
    trackedCompanies: string[]
  ): Promise<AiEmailClassifyResult> {
    const fakeAppList = trackedCompanies.map((c, i) => ({
      id: `app_${i}`,
      job: { company: c, title: 'Engineer' } as any,
    })) as any[];

    const result = EmailService.classifyEmail(
      {
        messageId: 'test_msg',
        threadId: 'test_th',
        sender: 'recruiter@example.com',
        subject,
        dateReceived: new Date().toISOString(),
        body,
      },
      fakeAppList
    );

    return {
      classification: result.classification,
      confidence: result.confidence,
      evidence: result.evidence,
    };
  }

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Deterministic engine is active and requires zero external network calls.',
    };
  }
}

/**
 * 2. Google Gemini Flash Provider (Optional Free-Tier AI Model)
 */
export class GeminiAiProvider implements AiProvider {
  public readonly id = 'GEMINI';
  public readonly name = 'Google Gemini Flash (AI Studio Free Tier)';
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim();
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Ping');
      const text = result.response.text();
      return {
        success: true,
        message: `Connected successfully to Google Gemini Flash API.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to authenticate with Google Gemini API.',
      };
    }
  }

  public async tailorBullet(
    originalBullet: string,
    targetSkills: string[],
    jobContext: { title: string; company: string }
  ): Promise<AiTailorBulletResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a professional resume editor operating under STRICT CANDIDATE INTEGRITY rules.
Your task is to rephrase the candidate's existing work achievement bullet point to emphasize professional action verbs and relevance to a ${jobContext.title} role at ${jobContext.company}.

NON-NEGOTIABLE INTEGRITY RULES:
1. NEVER invent or alter numerical metrics, percentages, dollar figures, or user counts. If the original does not have a metric, DO NOT add one.
2. NEVER add new technical skills or tools that do not appear in the original bullet or target skills list (${targetSkills.join(', ')}).
3. Do not exaggerate responsibilities.
4. Output MUST be a single concise bullet sentence starting with a strong past-tense action verb (e.g. Engineered, Architected, Spearheaded, Optimized, Streamlined).
5. Output ONLY the rewritten bullet text, nothing else.

Original Bullet: "${originalBullet}"`;

      const result = await model.generateContent(prompt);
      const tailored = result.response.text().trim().replace(/^[•\-\*]\s*/, '');
      const actionVerb = tailored.split(/\s+/)[0] || 'Engineered';

      return {
        tailoredText: tailored,
        actionVerb,
      };
    } catch {
      // Fallback to deterministic if API error occurs
      return TailoringService.enhanceBulletDeterministically(originalBullet, targetSkills);
    }
  }

  public async generateCoverLetter(params: AiCoverLetterParams): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Write a concise, professional, truthful cover letter for ${params.candidateName} applying for ${params.jobTitle} at ${params.company}.

NON-NEGOTIABLE INTEGRITY RULES:
1. Ground the letter STRICTLY in these verified candidate credentials:
   - Demonstrated Skills: ${params.topSkills.join(', ')}
   - Verified Experience: ${params.relevantExperienceSnippet}
2. DO NOT invent previous employers, unmentioned technologies, degrees, or metrics.
3. Keep the tone humble, confident, and professional.
4. Maximum 3-4 paragraphs.
5. End with the candidate's name and contact details.

Contact Info to include at bottom:
${params.contactInfo}`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch {
      // Fallback to deterministic
      const fallback = new DeterministicAiProvider();
      return fallback.generateCoverLetter(params);
    }
  }

  public async classifyEmail(
    subject: string,
    body: string,
    trackedCompanies: string[]
  ): Promise<AiEmailClassifyResult> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `Classify this recruitment email into exactly ONE of the following categories:
- APPLICATION_CONFIRMATION
- RECRUITER_OUTREACH
- INTERVIEW_INVITATION
- REJECTION
- OFFER
- UNMATCHED

Tracked Companies: ${trackedCompanies.join(', ')}
Subject: "${subject}"
Body: "${body}"

Return JSON matching:
{
  "classification": "CATEGORY_NAME",
  "confidence": 0.0 to 1.0,
  "evidence": ["quote or reason 1", "quote or reason 2"]
}`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      return {
        classification: parsed.classification,
        confidence: Number(parsed.confidence) || 0.85,
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [parsed.evidence || 'AI classification'],
      };
    } catch {
      const fallback = new DeterministicAiProvider();
      return fallback.classifyEmail(subject, body, trackedCompanies);
    }
  }
}

/**
 * 3. AI Service Manager Factory
 */
export class AiServiceManager {
  public static getProvider(apiKey?: string, preferredType?: 'DETERMINISTIC' | 'GEMINI'): AiProvider {
    const key = apiKey || process.env.GEMINI_API_KEY;

    if (preferredType === 'GEMINI' && key && key.trim()) {
      return new GeminiAiProvider(key);
    }

    if (key && key.trim() && preferredType !== 'DETERMINISTIC') {
      return new GeminiAiProvider(key);
    }

    return new DeterministicAiProvider();
  }
}
