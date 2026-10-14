'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Wrench,
  Compass,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ResumeParser } from '@/lib/parser/resume-parser';
import { ExperienceClassifier } from '@/lib/classification/experience-classifier';

export default function OnboardingPage() {
  const router = useRouter();
  const { masterResume, updateMasterResume, preferences, updatePreferences } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rawText, setRawText] = useState(masterResume.rawText || '');
  const [candidateName, setCandidateName] = useState(masterResume.contact.fullName);
  const [candidateEmail, setCandidateEmail] = useState(masterResume.contact.email);
  const [targetRoles, setTargetRoles] = useState(preferences.targetRoles.join(', '));
  const [locations, setLocations] = useState(preferences.preferredLocations.join(', '));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleResumeText = `ALEX MORGAN
alex.morgan@example.com | (555) 234-5678 | San Francisco, CA
linkedin.com/in/alexmorgan | github.com/alexmorgan

PROFESSIONAL SUMMARY
Full Stack Software Engineer with 2+ years of experience developing responsive web applications and performant APIs.

WORK EXPERIENCE
Frontend Engineer at CloudScale Inc.
2023-01 to Present
• Developed dynamic dashboard interfaces using React, Next.js, and TypeScript, improving user retention by 22%.
• Built automated CI/CD pipelines with GitHub Actions and Docker, reducing deployment cycle times.
• Implemented client-side caching with Redis, reducing database load by 35%.

Software Engineering Intern at DataFlow Systems
2022-06 to 2022-08
• Constructed RESTful APIs with Node.js and PostgreSQL for real-time telemetry streaming.
• Authored comprehensive unit tests with Vitest, achieving 90% test coverage across core microservices.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2019 - 2023)

SKILLS
TypeScript, JavaScript, React, Next.js, Node.js, PostgreSQL, Docker, Redis, Tailwind CSS, Git`;

  const handleUseSample = () => {
    setRawText(sampleResumeText);
    setUploadError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', masterResume.userId);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume file.');
      }

      updateMasterResume(data.masterResume);
      setRawText(data.masterResume.rawText);
      setCandidateName(data.masterResume.contact.fullName);
      setCandidateEmail(data.masterResume.contact.email);
      setStep(2);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleStep1Submit = () => {
    if (!rawText.trim()) return;
    const parsed = ResumeParser.parseRawText(rawText, 'master_resume.txt', masterResume.userId);
    updateMasterResume(parsed);
    setCandidateName(parsed.contact.fullName);
    setCandidateEmail(parsed.contact.email);
    setStep(2);
  };

  const handleStep2Submit = () => {
    setStep(3);
  };

  const handleFinishOnboarding = () => {
    updatePreferences({
      targetRoles: targetRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
      preferredLocations: locations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    });
    router.push('/app/dashboard');
  };

  const experienceCalc = ExperienceClassifier.calculateExperience(masterResume.experiences);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              JobPilot <span className="text-indigo-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 mt-2">Welcome to JobPilot AI</h1>
          <p className="text-xs text-slate-400">
            Let&apos;s configure your immutable master profile and job discovery preferences.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <div
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
              step >= 1 ? 'bg-indigo-950 border border-indigo-700 text-indigo-300' : 'bg-slate-900 text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Master Resume</span>
          </div>

          <div className="w-6 h-0.5 bg-slate-800" />

          <div
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
              step >= 2 ? 'bg-indigo-950 border border-indigo-700 text-indigo-300' : 'bg-slate-900 text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Experience Review</span>
          </div>

          <div className="w-6 h-0.5 bg-slate-800" />

          <div
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
              step >= 3 ? 'bg-indigo-950 border border-indigo-700 text-indigo-300' : 'bg-slate-900 text-slate-500'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Job Preferences</span>
          </div>
        </div>

        {/* Step 1: Ingest Resume */}
        {step === 1 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    Step 1: Ingest Your Master Resume
                  </CardTitle>
                  <CardDescription>
                    Upload a DOCX, PDF, or TXT file, or paste your plain text below.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleUseSample} className="text-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  Load Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".docx,.pdf,.txt,.md"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-200">
                  {isUploading ? 'Extracting text and analyzing...' : 'Click to upload your resume file'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports DOCX, PDF, and TXT (Max 5MB)
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[11px] uppercase tracking-wider">
                  Or paste resume text
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste complete plain text resume here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl text-xs text-indigo-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  The master resume serves as your immutable single source of truth. All tailored applications will reference this exact text.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" disabled={!rawText.trim() || isUploading} onClick={handleStep1Submit}>
                  Parse & Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Experience & Classification Review */}
        {step === 2 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Step 2: Experience & Internship Classification Review
              </CardTitle>
              <CardDescription>
                Review your classified employment history. JobPilot AI rigorously separates internships from full-time roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Total Relevant</span>
                  <span className="text-xl font-bold text-indigo-400 block mt-1">
                    {experienceCalc.totalRelevantMonths} mos
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 uppercase font-medium block">Full-Time</span>
                  <span className="text-xl font-bold text-emerald-400 block mt-1">
                    {experienceCalc.fullTimeMonths} mos
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 uppercase font-medium block">Internships</span>
                  <span className="text-xl font-bold text-amber-400 block mt-1">
                    {experienceCalc.internshipMonths + experienceCalc.coOpMonths} mos
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Extracted Skills</span>
                  <span className="text-xl font-bold text-slate-200 block mt-1">
                    {masterResume.skills.length} skills
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Extracted Experiences ({masterResume.experiences.length})
                </h4>
                {masterResume.experiences.map((exp) => (
                  <div key={exp.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-200 block">{exp.jobTitle}</span>
                      <span className="text-xs text-indigo-400">{exp.employer} ({exp.startDate} - {exp.endDate || 'Present'})</span>
                    </div>
                    <Badge variant={exp.category === 'FULL_TIME' ? 'success' : 'warning'} size="sm">
                      {exp.category.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={handleStep2Submit}>
                  Confirm Classification & Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Target Roles & Preferences */}
        {step === 3 && (
          <Card className="border-slate-800 bg-slate-900/90 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                Step 3: Define Target Roles & Preferences
              </CardTitle>
              <CardDescription>
                Customize parameters for live job discovery and explainable matching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target Job Titles (Comma-separated)
                </label>
                <input
                  type="text"
                  value={targetRoles}
                  onChange={(e) => setTargetRoles(e.target.value)}
                  placeholder="Full Stack Engineer, Frontend Engineer, Software Developer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Preferred Locations (Comma-separated)
                </label>
                <input
                  type="text"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="Remote, San Francisco, CA, New York, NY"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  Setup complete! Your dashboard is seeded with real public job feeds, explainable scoring, and truthful tailoring tools.
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
                <Button variant="primary" size="sm" onClick={handleFinishOnboarding}>
                  Launch JobPilot AI Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
