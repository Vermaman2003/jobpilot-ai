import { describe, it, expect } from 'vitest';
import { ResumeParser } from '@/lib/parser/resume-parser';

describe('ResumeParser', () => {
  const sampleResume = `Sarah Connor
sarah.connor@cyberdyne.com | (555) 019-2834 | Los Angeles, CA
https://linkedin.com/in/sarah-connor | https://github.com/sarah-connor

SUMMARY
Experienced systems engineer specializing in distributed architecture and resilient microservices.

EXPERIENCE
Systems Engineer at Cyberdyne Inc.
2023-01 to Present
• Architected fault-tolerant Node.js and TypeScript services with 99.99% uptime.
• Reduced PostgreSQL database query latency by 45% using indexed partitioning.
• Collaborated in cross-functional squads to deploy containerized microservices via Docker and Kubernetes.

Engineering Intern at Resistance Corp
2022-06 to 2022-08
• Built automated Python test runners for regression benchmarking.
• Documented system recovery runbooks and monitored telemetry metrics.

EDUCATION
Bachelor of Science in Computer Science
UCLA (2018 - 2022)

SKILLS
TypeScript, JavaScript, Python, Node.js, React, Docker, Kubernetes, PostgreSQL, Git, CI/CD`;

  it('extracts contact details accurately', () => {
    const contact = ResumeParser.extractContact(sampleResume);
    expect(contact.fullName).toBe('Sarah Connor');
    expect(contact.email).toBe('sarah.connor@cyberdyne.com');
    expect(contact.phone).toContain('555');
    expect(contact.linkedinUrl).toContain('linkedin.com/in/sarah-connor');
    expect(contact.githubUrl).toContain('github.com/sarah-connor');
  });

  it('extracts and categorizes skills from text catalog', () => {
    const skills = ResumeParser.extractSkills(sampleResume);
    const skillNames = skills.map((s) => s.name);

    expect(skillNames).toContain('TypeScript');
    expect(skillNames).toContain('Python');
    expect(skillNames).toContain('Docker');
    expect(skillNames).toContain('PostgreSQL');

    const tsSkill = skills.find((s) => s.name === 'TypeScript');
    expect(tsSkill?.category).toBe('PROGRAMMING_LANGUAGE');

    const dockerSkill = skills.find((s) => s.name === 'Docker');
    expect(dockerSkill?.category).toBe('CLOUD_INFRA');
  });

  it('generates consistent and deterministic SHA checksums', () => {
    const hash1 = ResumeParser.calculateChecksum(sampleResume);
    const hash2 = ResumeParser.calculateChecksum(sampleResume);
    expect(hash1).toBe(hash2);

    const modified = sampleResume + '\nExtra claim';
    const hash3 = ResumeParser.calculateChecksum(modified);
    expect(hash1).not.toBe(hash3);
  });

  it('parses complete raw text into an immutable MasterResume', () => {
    const master = ResumeParser.parseRawText(sampleResume, 'test_resume.txt', 'user_123');
    expect(master.userId).toBe('user_123');
    expect(master.fileName).toBe('test_resume.txt');
    expect(master.isImmutable).toBe(true);
    expect(master.contact.fullName).toBe('Sarah Connor');
    expect(master.experiences.length).toBeGreaterThanOrEqual(1);
    expect(master.skills.length).toBeGreaterThanOrEqual(5);
  });
});
