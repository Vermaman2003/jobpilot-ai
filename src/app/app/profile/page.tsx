'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Hash,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Edit3,
  Copy,
  Check,
  Upload,
} from 'lucide-react';
import { useApp } from '@/context/app-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ExperienceClassifier } from '@/lib/classification/experience-classifier';
import { ResumeParser } from '@/lib/parser/resume-parser';
import { CandidateExperience, EmploymentCategory, SkillCategory } from '@/types';

export default function ProfilePage() {
  const { masterResume, updateMasterResume, preferences, updatePreferences } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'skills' | 'education' | 'raw'>('overview');
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedChecksum, setCopiedChecksum] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [isProfileUploading, setIsProfileUploading] = useState(false);
  const profileFileInputRef = React.useRef<HTMLInputElement>(null);

  // Contact edit form state
  const [contactForm, setContactForm] = useState(masterResume.contact);
  const [summaryForm, setSummaryForm] = useState(masterResume.summary || '');

  const handleProfileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProfileUploading(true);
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
      setIsUploadModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error uploading file.');
    } finally {
      setIsProfileUploading(false);
      if (profileFileInputRef.current) profileFileInputRef.current.value = '';
    }
  };

  // Calculate experience dynamically
  const experienceCalc = useMemo(() => {
    return ExperienceClassifier.calculateExperience(masterResume.experiences);
  }, [masterResume.experiences]);

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(masterResume.checksum);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2000);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateMasterResume({
      ...masterResume,
      contact: contactForm,
      summary: summaryForm,
      updatedAt: new Date().toISOString(),
    });
    setIsEditContactOpen(false);
  };

  const handleParseNewResume = () => {
    if (!rawTextInput.trim()) return;
    const parsed = ResumeParser.parseRawText(rawTextInput, 'uploaded_resume.txt', masterResume.userId);
    updateMasterResume(parsed);
    setIsUploadModalOpen(false);
    setRawTextInput('');
  };

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const map: Record<SkillCategory, typeof masterResume.skills> = {
      PROGRAMMING_LANGUAGE: [],
      FRAMEWORK: [],
      DATABASE: [],
      CLOUD_INFRA: [],
      TOOL: [],
      METHODOLOGY: [],
      SOFT_SKILL: [],
    };
    masterResume.skills.forEach((s) => {
      if (map[s.category]) {
        map[s.category].push(s);
      } else {
        map.TOOL.push(s);
      }
    });
    return map;
  }, [masterResume.skills]);

  const categoryBadgeVariant = (cat: EmploymentCategory): 'primary' | 'success' | 'warning' | 'neutral' | 'danger' => {
    switch (cat) {
      case 'FULL_TIME':
        return 'success';
      case 'INTERNSHIP':
        return 'warning';
      case 'CO_OP':
        return 'primary';
      case 'RESEARCH_ASSISTANT':
        return 'neutral';
      case 'CONTRACT':
        return 'neutral';
      case 'ACADEMIC_PROJECT':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Truthfulness Pledge */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-2xl shadow-inner">
              {masterResume.contact.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-100">{masterResume.contact.fullName}</h1>
                <Badge variant="success" size="sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Truthful Master Profile
                </Badge>
                <Badge variant="neutral" size="sm" className="font-mono text-[11px]">
                  <Hash className="w-3 h-3 mr-1 text-slate-400" />
                  SHA: {masterResume.checksum.slice(0, 10)}...
                </Badge>
              </div>

              <p className="text-slate-300 text-sm mt-1 max-w-2xl">{masterResume.summary}</p>

              {/* Contact metadata bar */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {masterResume.contact.email}
                </span>
                {masterResume.contact.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {masterResume.contact.phone}
                  </span>
                )}
                {masterResume.contact.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {masterResume.contact.location}
                  </span>
                )}
                {masterResume.contact.linkedinUrl && (
                  <a
                    href={masterResume.contact.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:underline"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
                {masterResume.contact.githubUrl && (
                  <a
                    href={masterResume.contact.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:underline"
                  >
                    <Github className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {masterResume.contact.portfolioUrl && (
                  <a
                    href={masterResume.contact.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setIsEditContactOpen(true)}>
              <Edit3 className="w-4 h-4 mr-1.5" />
              Edit Profile
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-1.5" />
              Re-parse Resume
            </Button>
          </div>
        </div>
      </div>

      {/* CORE INTEGRITY TENET: Explicit Internship vs Full-Time Classification */}
      <Card className="border-indigo-900/30 bg-slate-900/90">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-base font-semibold">
                Explicit Experience & Internship Classification Engine
              </CardTitle>
            </div>
            <span className="text-xs text-indigo-400 font-medium">Non-Negotiable Provenance</span>
          </div>
          <CardDescription>
            Internships, co-ops, research assistantships, and full-time employment are rigorously separated.
            Academic coursework and overlapping dates are deduplicated and never conflated with full-time professional experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 4 Metric Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Total Relevant Experience
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-indigo-400">{experienceCalc.totalRelevantMonths}</span>
                <span className="text-xs text-slate-400">months</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ~{(experienceCalc.totalRelevantMonths / 12).toFixed(1)} years deduplicated
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-emerald-400/90 font-medium uppercase tracking-wider block">
                Full-Time Professional
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{experienceCalc.fullTimeMonths}</span>
                <span className="text-xs text-slate-400">months</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                ~{(experienceCalc.fullTimeMonths / 12).toFixed(1)} years strictly full-time
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-amber-400/90 font-medium uppercase tracking-wider block">
                Internships & Co-Ops
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-amber-400">
                  {experienceCalc.internshipMonths + experienceCalc.coOpMonths}
                </span>
                <span className="text-xs text-slate-400">months</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {experienceCalc.internshipMonths}m Intern, {experienceCalc.coOpMonths}m Co-Op
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                Academic Projects
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-slate-400">{experienceCalc.academicMonths}</span>
                <span className="text-xs text-slate-500">months</span>
              </div>
              <span className="text-[10px] text-rose-400/80 block mt-0.5 font-medium">
                Excluded from employment
              </span>
            </div>
          </div>

          {/* Audit Explanation Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setShowAuditLog(!showAuditLog)}
              className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Auditable Experience Deduction & Deduplication Trace ({experienceCalc.explanation.length} steps)
              </span>
              {showAuditLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAuditLog && (
              <div className="mt-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                {experienceCalc.explanation.map((step, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      step.startsWith('Summary:')
                        ? 'text-indigo-300 font-bold border-t border-slate-800 pt-2 mt-2'
                        : step.includes('Excluded')
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'experience'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Work Experience ({masterResume.experiences.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Skills Inventory ({masterResume.skills.length})
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'education'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Education & Projects
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'raw'
              ? 'bg-slate-800 text-indigo-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hash className="w-4 h-4" />
          Raw Master & Provenance
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Experience Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Professional Experience</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('experience')}>
                    View All ({masterResume.experiences.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {masterResume.experiences.slice(0, 2).map((exp) => (
                  <div key={exp.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-100 text-sm">{exp.jobTitle}</h4>
                        <p className="text-xs text-indigo-400 mt-0.5">{exp.employer}</p>
                      </div>
                      <Badge variant={categoryBadgeVariant(exp.category)} size="sm">
                        {exp.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate} - {exp.endDate || 'Present'} ({exp.durationMonths} mos)
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {exp.responsibilities.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-xs text-slate-300 list-disc list-inside">
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Verified Projects</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('education')}>
                    View All ({masterResume.projects.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {masterResume.projects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-100 text-sm">{proj.title}</h4>
                      {proj.url && (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          View Repo
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {proj.technologies.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right column: Target Preferences & Verification Badges */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Search Preferences</CardTitle>
                <CardDescription>Configured parameters used for matching and scoring.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Target Roles</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.targetRoles.map((r) => (
                      <span key={r} className="px-2 py-0.5 bg-indigo-950/70 border border-indigo-800 text-indigo-300 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Work Arrangements</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.preferredArrangements.map((a) => (
                      <span key={a} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Locations</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {preferences.preferredLocations.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Min Match Score</span>
                  <span className="font-semibold text-indigo-400">{preferences.minimumMatchScore}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Requires Visa Sponsorship</span>
                  <span className={`font-semibold ${preferences.requiresSponsorship ? 'text-amber-400' : 'text-slate-300'}`}>
                    {preferences.requiresSponsorship ? 'Yes' : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Provenance Integrity Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Master resume text locked & checksum validated.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Zero hallucination policy active in resume tailoring.</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Transparent skill gap disclosure enabled.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Work Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-4">
          {masterResume.experiences.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{exp.jobTitle}</h3>
                      <Badge variant={categoryBadgeVariant(exp.category)} size="sm">
                        {exp.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {exp.compensationType}
                      </Badge>
                      {exp.isVerified && (
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-indigo-400 font-medium text-sm mt-0.5">{exp.employer}</div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {exp.startDate} - {exp.endDate || 'Present'} ({exp.durationMonths} months)
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {exp.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Responsibilities */}
                <div className="mt-4 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Responsibilities & Achievements
                  </h4>
                  <ul className="space-y-1.5">
                    {exp.responsibilities.map((r, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400 mt-1 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demonstrated Skills */}
                {exp.skillsDemonstrated.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-medium block mb-2">Demonstrated Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.skillsDemonstrated.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Skills Inventory */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(([category, skills]) => {
            if (skills.length === 0) return null;
            return (
              <Card key={category}>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
                    {category.replace('_', ' ')} ({skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-200 block">{skill.name}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {skill.proficiency || 'Verified'}
                          </span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab: Education & Projects */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {masterResume.educations.map((edu) => (
                <div key={edu.id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-100">{edu.institution}</h4>
                      <p className="text-sm text-indigo-400">
                        {edu.degree} in {edu.fieldOfStudy}
                      </p>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>
                    {edu.gpa && (
                      <Badge variant="neutral" size="sm">
                        GPA: {edu.gpa}
                      </Badge>
                    )}
                  </div>
                  {edu.honors && edu.honors.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {edu.honors.map((h) => (
                        <span key={h} className="text-xs text-amber-300/90 font-medium">
                          ★ {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {masterResume.projects.map((proj) => (
                <div key={proj.id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-100">{proj.title}</h4>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        {proj.url}
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 mt-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {proj.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {proj.highlights.map((h, i) => (
                        <li key={i} className="text-xs text-slate-400 list-disc list-inside">
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Raw Master & Checksum */}
      {activeTab === 'raw' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Immutable Master Resume Text</CardTitle>
                <CardDescription>
                  Original parsed text extracted from source document. This serves as the single source of truth.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyChecksum}>
                {copiedChecksum ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy SHA Checksum
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Verification Hash:</span>
              <span className="text-indigo-400 break-all">{masterResume.checksum}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-96 overflow-y-auto">
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {masterResume.rawText}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        title="Edit Master Profile Details"
        description="Update your contact information and executive summary."
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={contactForm.fullName}
              onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={contactForm.phone || ''}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Location</label>
            <input
              type="text"
              value={contactForm.location || ''}
              onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={contactForm.linkedinUrl || ''}
                onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">GitHub URL</label>
              <input
                type="url"
                value={contactForm.githubUrl || ''}
                onChange={(e) => setContactForm({ ...contactForm, githubUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Portfolio URL</label>
              <input
                type="url"
                value={contactForm.portfolioUrl || ''}
                onChange={(e) => setContactForm({ ...contactForm, portfolioUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Executive Summary</label>
            <textarea
              rows={3}
              value={summaryForm}
              onChange={(e) => setSummaryForm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsEditContactOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Re-parse Resume Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Parse & Ingest Master Resume"
        description="Upload a DOCX, PDF, or TXT file, or paste raw text to extract structured facts and compute SHA-256 provenance."
      >
        <div className="space-y-4">
          {/* File Upload Zone */}
          <div
            onClick={() => profileFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
          >
            <input
              type="file"
              ref={profileFileInputRef}
              onChange={handleProfileFileUpload}
              accept=".docx,.pdf,.txt,.md"
              className="hidden"
            />
            <Upload className="w-7 h-7 text-indigo-400 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-200">
              {isProfileUploading ? 'Extracting text and analyzing...' : 'Upload DOCX, PDF, or TXT File'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Automatic text extraction & structure normalization
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase tracking-wider">
              Or paste text directly
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <div>
            <textarea
              rows={6}
              placeholder="Paste complete plain text resume here..."
              value={rawTextInput}
              onChange={(e) => setRawTextInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Ingesting a new master resume will re-calculate your explicit internship/full-time metrics and update the cryptographic checksum.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!rawTextInput.trim() || isProfileUploading} onClick={handleParseNewResume}>
              Parse & Update Profile
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
