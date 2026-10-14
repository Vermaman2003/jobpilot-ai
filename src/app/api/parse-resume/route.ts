import { NextRequest, NextResponse } from 'next/server';
import { ResumeParser } from '@/lib/parser/resume-parser';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Handle JSON payload with rawText
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const rawText = body.rawText || body.text;
      const fileName = body.fileName || 'uploaded_resume.txt';
      const userId = body.userId || 'user_default';

      if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
        return NextResponse.json(
          { success: false, error: 'Empty resume text provided.' },
          { status: 400 }
        );
      }

      const masterResume = ResumeParser.parseRawText(rawText, fileName, userId);
      return NextResponse.json({ success: true, masterResume });
    }

    // Handle Multipart Form Data with file
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const userId = (formData.get('userId') as string) || 'user_default';

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file found in upload request.' },
          { status: 400 }
        );
      }

      const fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let extractedText = '';

      if (fileName.toLowerCase().endsWith('.docx')) {
        // Extract text using mammoth
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else if (fileName.toLowerCase().endsWith('.txt') || fileName.toLowerCase().endsWith('.md')) {
        extractedText = buffer.toString('utf-8');
      } else if (fileName.toLowerCase().endsWith('.pdf')) {
        // Fallback for PDF text extraction or decoded text
        // Strip non-printable / binary headers and preserve ascii lines
        const rawString = buffer.toString('binary');
        // Simple stream text extractor for standard text-based PDFs
        const textMatches = rawString.match(/\((.*?)\)\s*Tj/g) || [];
        if (textMatches.length > 0) {
          extractedText = textMatches
            .map((m) => m.replace(/^\(/, '').replace(/\)\s*Tj$/, ''))
            .join(' ');
        } else {
          // Clean fallback string representation
          extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\r\n\t]/g, ' ');
        }
      } else {
        extractedText = buffer.toString('utf-8');
      }

      if (!extractedText.trim() || extractedText.length < 20) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Could not extract readable text from the uploaded file. Please paste the plain text directly.',
          },
          { status: 422 }
        );
      }

      const masterResume = ResumeParser.parseRawText(extractedText, fileName, userId);
      return NextResponse.json({ success: true, masterResume });
    }

    return NextResponse.json(
      { success: false, error: 'Unsupported Content-Type header.' },
      { status: 415 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An error occurred while parsing the resume.',
      },
      { status: 500 }
    );
  }
}
