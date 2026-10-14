'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileDown,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { Application, MasterResume, TailoredResume } from '@/types';
import { useApp } from '@/context/app-context';
import { ResumeExporter } from '@/lib/export/resume-exporter';
import { ClaimProvenanceEngine } from '@/lib/integrity/claim-provenance';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface SideBySideTailorProps {
  application: Application;
  masterResume: MasterResume;
  tailoredResume: TailoredResume;
  onUpdateTailored: (updated: TailoredResume) => void;
}

export const SideBySideTailor: React.FC<SideBySideTailorProps> = ({
  application,
  masterResume,
  tailoredResume,
  onUpdateTailored,
}) => {
  const [activeTab, setActiveTab] = useState<'experiences' | 'projects' | 'gaps'>('experiences');
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Compute provenance audit
  const audit = React.useMemo(() => {
    return ClaimProvenanceEngine.auditTailoredResume(tailoredResume.provenanceMap);
  }, [tailoredResume]);

  // Handle editing a tailored bullet
  const handleEditBullet = (expIndex: number, bulletIndex: number, newText: string) => {
    const updated = { ...tailoredResume };
    const original = updated.tailoredExperiences[expIndex].bullets[bulletIndex].originalText;
    const factId = `${updated.tailoredExperiences[expIndex].experienceId}_bullet_${bulletIndex}`;

    // Re-verify provenance on edit
    const newProv = ClaimProvenanceEngine.verifyBulletProvenance(
      newText,
      original,
      factId,
      masterResume
    );

    updated.tailoredExperiences[expIndex].bullets[bulletIndex].tailoredText = newText;
    updated.tailoredExperiences[expIndex].bullets[bulletIndex].provenance = newProv;

    // Update provenance map
    const pIdx = updated.provenanceMap.findIndex((p) => p.sourceFactId === factId);
    if (pIdx !== -1) {
      updated.provenanceMap[pIdx] = newProv;
    } else {
      updated.provenanceMap.push(newProv);
    }

    onUpdateTailored(updated);
  };

  // Revert a bullet to master original
  const handleRevertBullet = (expIndex: number, bulletIndex: number) => {
    const original = tailoredResume.tailoredExperiences[expIndex].bullets[bulletIndex].originalText;
    handleEditBullet(expIndex, bulletIndex, original);
  };

  // Real DOCX Export and Browser Download
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const buffer = await ResumeExporter.generateDocx(masterResume, tailoredResume);
      const blob = new Blob([buffer as any], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${masterResume.contact.fullName.replace(/\s+/g, '_')}_${application.job.company}_Resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('DOCX export error:', err);
      alert('Failed to generate DOCX file. Please check console.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Real Text-based PDF Export and Browser Download
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      const buffer = ResumeExporter.generatePdf(masterResume, tailoredResume);
      const blob = new Blob([buffer as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${masterResume.contact.fullName.replace(/\s+/g, '_')}_${application.job.company}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF file. Please check console.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Integrity & Provenance Audit Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          audit.isValid
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {audit.isValid ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              Candidate Integrity Guarantee
              <Badge variant={audit.isValid ? 'success' : 'warning'} size="sm">
                {audit.isValid ? '100% Provenance Verified' : `${audit.flaggedCount} Claims Flagged`}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{audit.summary}</p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadDocx}
            isLoading={isExportingDocx}
            icon={<FileDown className="w-4 h-4 text-indigo-400" />}
          >
            Download DOCX
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleDownloadPdf}
            isLoading={isExportingPdf}
            icon={<FileText className="w-4 h-4 text-white" />}
          >
            Export ATS PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('experiences')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'experiences' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Tailored Experiences ({tailoredResume.tailoredExperiences.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Tailored Projects ({tailoredResume.tailoredProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'gaps' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Reported Skill Gaps ({tailoredResume.reportedSkillGaps.length})
        </button>
      </div>

      {/* Side-by-Side Experiences Comparison */}
      {activeTab === 'experiences' && (
        <div className="space-y-6">
          {tailoredResume.tailoredExperiences.map((exp, expIdx) => (
            <div key={exp.experienceId} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{exp.jobTitle}</h4>
                  <span className="text-xs text-slate-400">{exp.employer}</span>
                </div>
                <Badge variant="neutral" size="sm">
                  Role Grounding
                </Badge>
              </div>

              <div className="mt-4 space-y-4">
                {exp.bullets.map((bullet, bIdx) => (
                  <div
                    key={bIdx}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg"
                  >
                    {/* Left: Master Resume Baseline */}
                    <div className="border-r-0 lg:border-r border-slate-800/80 lg:pr-4">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Master Resume Baseline</span>
                        <span className="text-[10px] text-slate-400">Immutable</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{bullet.originalText}</p>
                    </div>

                    {/* Right: Tailored Version */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            Tailored For ATS ({bullet.actionVerbEmphasized})
                          </span>

                          {/* Provenance Badge */}
                          <Badge
                            variant={
                              bullet.provenance.status === 'VERIFIED'
                                ? 'success'
                                : bullet.provenance.status === 'SUPPORTED_WITH_REPHRASING'
                                ? 'primary'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {bullet.provenance.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {/* Editable Tailored Bullet */}
                        <textarea
                          rows={3}
                          value={bullet.tailoredText}
                          onChange={(e) => handleEditBullet(expIdx, bIdx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                        />

                        {/* Flag Warning */}
                        {bullet.provenance.status === 'UNSUPPORTED_FLAGGED' && (
                          <div className="mt-1.5 p-2 bg-rose-950/40 border border-rose-800/40 rounded text-[11px] text-rose-300 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <span>{bullet.provenance.integrityFlagReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {bullet.tailoredText === bullet.originalText ? 'Unchanged' : 'Polished'}
                        </span>
                        <button
                          onClick={() => handleRevertBullet(expIdx, bIdx)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Revert to Master
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {tailoredResume.tailoredProjects.map((proj) => (
            <div key={proj.projectId} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-slate-100">{proj.title}</h4>
              <div className="mt-3 space-y-3">
                {proj.bullets.map((bullet, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-300">{bullet.tailoredText}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reported Skill Gaps (Candidate Integrity Rule) */}
      {activeTab === 'gaps' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-semibold text-slate-100">Transparent Skill Gaps Report</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Under JobPilot AI&apos;s <strong>Candidate Integrity Policy</strong>, skills required by the job that do not
            appear in your verified master resume are <em>never</em> automatically injected into your resume merely to game
            ATS matching scores. Instead, they are reported here so you can prepare talking points or upskill.
          </p>

          <div className="mt-5 space-y-2">
            {tailoredResume.reportedSkillGaps.length === 0 ? (
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-emerald-300 text-xs">
                Zero skill gaps! Your verified master profile covers 100% of declared required skills.
              </div>
            ) : (
              tailoredResume.reportedSkillGaps.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                >
                  <span className="font-medium text-slate-200">{skill}</span>
                  <Badge variant="warning" size="sm">
                    Required by Employer
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
