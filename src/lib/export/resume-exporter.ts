/**
 * JobPilot AI — ATS-Friendly Document Exporter
 * Generates clean, selectable-text PDFs (via jsPDF) and real DOCX files (via docx).
 * Strict ATS format: standard headings, clean linear flow, no graphical tables/sidebars.
 */

import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from 'docx';
import { jsPDF } from 'jspdf';
import { MasterResume, TailoredResume } from '@/types';

export class ResumeExporter {
  /**
   * Generate an ATS-compliant DOCX file as an ArrayBuffer/Blob.
   */
  public static async generateDocx(
    master: MasterResume,
    tailored?: TailoredResume
  ): Promise<Uint8Array> {
    const contact = master.contact;
    const experiences = tailored ? tailored.tailoredExperiences : master.experiences.map((e) => ({
      jobTitle: e.jobTitle,
      employer: e.employer,
      bullets: e.responsibilities.map((r) => ({ tailoredText: r })),
    }));

    const paragraphs: Paragraph[] = [
      // Name (Title)
      new Paragraph({
        text: contact.fullName,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      // Contact Info Line
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun(`${contact.email} | `),
          new TextRun(contact.phone ? `${contact.phone} | ` : ''),
          new TextRun(contact.location ? `${contact.location} | ` : ''),
          new TextRun(contact.linkedinUrl || ''),
        ],
        spacing: { after: 200 },
      }),
    ];

    // Summary Section
    const summaryText = tailored?.summary || master.summary;
    if (summaryText) {
      paragraphs.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: summaryText,
          spacing: { after: 200 },
        })
      );
    }

    // Skills Section
    const skillsList = tailored ? tailored.highlightedSkills : master.skills.map((s) => s.name);
    if (skillsList.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: 'TECHNICAL SKILLS',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: skillsList.join(', '),
          spacing: { after: 200 },
        })
      );
    }

    // Experience Section
    paragraphs.push(
      new Paragraph({
        text: 'WORK EXPERIENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );

    for (const exp of experiences) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.jobTitle, bold: true }),
            new TextRun(` at ${exp.employer}`),
          ],
          spacing: { before: 150, after: 50 },
        })
      );

      for (const bullet of exp.bullets) {
        paragraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            text: bullet.tailoredText,
            spacing: { after: 50 },
          })
        );
      }
    }

    // Education Section
    if (master.educations.length > 0) {
      paragraphs.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );

      for (const edu of master.educations) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${edu.degree} in ${edu.fieldOfStudy}`, bold: true }),
              new TextRun(` — ${edu.institution}`),
              new TextRun(edu.endDate ? ` (${edu.endDate})` : ''),
            ],
            spacing: { after: 50 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return new Uint8Array(buffer);
  }

  /**
   * Generate an ATS-compliant, selectable text PDF document using jsPDF.
   */
  public static generatePdf(
    master: MasterResume,
    tailored?: TailoredResume
  ): Uint8Array {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const contact = master.contact;
    let y = 40;
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // Name Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(contact.fullName, pageWidth / 2, y, { align: 'center' });
    y += 18;

    // Contact Details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const contactLine = [
      contact.email,
      contact.phone,
      contact.location,
      contact.linkedinUrl,
    ]
      .filter(Boolean)
      .join('  |  ');
    doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
    y += 25;

    // Helper to print section header
    const printSectionHeader = (title: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title, margin, y);
      y += 4;
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentWidth, y);
      y += 14;
    };

    // Summary
    const summaryText = tailored?.summary || master.summary;
    if (summaryText) {
      printSectionHeader('PROFESSIONAL SUMMARY');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
      doc.text(splitSummary, margin, y);
      y += splitSummary.length * 13 + 12;
    }

    // Technical Skills
    const skillsList = tailored ? tailored.highlightedSkills : master.skills.map((s) => s.name);
    if (skillsList.length > 0) {
      printSectionHeader('TECHNICAL SKILLS');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const skillsStr = skillsList.join(', ');
      const splitSkills = doc.splitTextToSize(skillsStr, contentWidth);
      doc.text(splitSkills, margin, y);
      y += splitSkills.length * 13 + 12;
    }

    // Work Experience
    printSectionHeader('WORK EXPERIENCE');
    const experiences = tailored ? tailored.tailoredExperiences : master.experiences.map((e) => ({
      jobTitle: e.jobTitle,
      employer: e.employer,
      bullets: e.responsibilities.map((r) => ({ tailoredText: r })),
    }));

    for (const exp of experiences) {
      if (y > 720) {
        doc.addPage();
        y = 40;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${exp.jobTitle} — ${exp.employer}`, margin, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      for (const bullet of exp.bullets) {
        const bulletText = `•  ${bullet.tailoredText}`;
        const splitBullet = doc.splitTextToSize(bulletText, contentWidth - 10);
        
        if (y + splitBullet.length * 12 > 750) {
          doc.addPage();
          y = 40;
        }

        doc.text(splitBullet, margin + 8, y);
        y += splitBullet.length * 13 + 2;
      }
      y += 6;
    }

    // Education
    if (master.educations.length > 0) {
      if (y > 700) {
        doc.addPage();
        y = 40;
      }
      printSectionHeader('EDUCATION');
      for (const edu of master.educations) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${edu.degree} in ${edu.fieldOfStudy}`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(` — ${edu.institution}${edu.endDate ? ` (${edu.endDate})` : ''}`, margin + 180, y);
        y += 16;
      }
    }

    return new Uint8Array(doc.output('arraybuffer'));
  }
}
