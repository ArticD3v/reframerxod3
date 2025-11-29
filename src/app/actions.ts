
"use server";

import { revalidatePath } from "next/cache";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";
import { generateRephrasedDocument } from "@/lib/ai/generate-rephrased-document";
import { z } from "zod";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const fullFormSchema = z.object({
  fullName: z.string(),
  rollNumber: z.string(),
  classAndSection: z.string(),
  studyLevel: z.string(),
  yearAndTerm: z.string(),
  subjectName: z.string(),
  assessmentName: z.string(),
  submissionDate: z.string().transform((str) => new Date(str)),
  creativity: z.string().transform(parseFloat),
  humanize: z.string().transform((str) => str === 'true'),
  document: z.any(),
});

// Helper to sanitize filename
const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9_]/g, "_");

export async function generateDocument(
  formData: FormData
): Promise<{ filename?: string; content?: string; error?: string }> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const parsedData = fullFormSchema.safeParse(rawData);

    if (!parsedData.success) {
      const errorMessages = parsedData.error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ');
      return { error: `Invalid form data: ${errorMessages}` };
    }

    const data = parsedData.data;
    const docFile = formData.get("document") as File;

    if (!docFile || docFile.size === 0) {
      return { error: "Document is required." };
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const fileName = docFile.name.toLowerCase();

    if (!validTypes.includes(docFile.type) && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      return { error: "Please upload a valid Word document (.docx or .doc file)." };
    }

    const buffer = Buffer.from(await docFile.arrayBuffer());
    const textExtractionResult = await mammoth.extractRawText({ buffer });
    let originalText = textExtractionResult.value;

    if (!originalText.trim()) {
      return {
        error: "Could not extract any text from the document. Please ensure it's not empty or corrupted.",
      };
    }

    const rephrasedResult = await generateRephrasedDocument({
      documentText: originalText,
      creativityLevel: data.creativity,
      humanize: data.humanize,
    });

    if (!rephrasedResult || !rephrasedResult.rephrasedContent) {
      throw new Error("AI rephrasing failed to return structured content.");
    }
    const content = rephrasedResult.rephrasedContent;

    // Read the template document
    const templatePath = path.join(process.cwd(), "public", "templates", "journal_template.docx");
    const templateBuffer = await fs.readFile(templatePath);

    // Load the template using pizzip
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Format learning content with bullet points
    const formatLearningContent = (learning: string): string => {
      const lines = learning.split('\n');
      return lines.map(line => {
        const trimmed = line.trim();
        // Skip empty lines
        if (trimmed === '') {
          return '';
        }
        // Check if line starts with asterisk (with or without space after)
        if (trimmed.startsWith('*')) {
          // Remove the leading asterisk and any spaces after it, then add bullet point
          const textAfterAsterisk = trimmed.replace(/^\*\s*/, '');
          return '• ' + textAfterAsterisk;
        }
        return trimmed;
      }).join('\n');
    };

    // Format application as bullet list
    const formatApplicationList = (items: string[]): string => {
      return items.map(item => '• ' + item).join('\n');
    };

    // Set the template variables
    doc.render({
      fullName: data.fullName,
      rollNumber: data.rollNumber,
      classAndSection: data.classAndSection,
      studyLevel: data.studyLevel,
      yearAndTerm: data.yearAndTerm,
      subjectName: data.subjectName,
      assessmentName: data.assessmentName,
      submissionDate: data.submissionDate.toLocaleDateString('en-CA'),
      topic: content.topic,
      experience: content.experience,
      feelings: content.feelings,
      learning: formatLearningContent(content.learning),
      application: formatApplicationList(content.application),
      conclusion: content.conclusion,
    });

    const docBuffer = doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    const filename = `Reflective_Journal_${sanitizeFilename(data.fullName)}.docx`;

    revalidatePath("/");

    return {
      filename,
      content: Buffer.from(docBuffer).toString("base64"),
    };
  } catch (error) {
    console.error("[generateDocument Error]", error);
    let errorMessage = "An unexpected error occurred while generating the document. Please try again.";
    if (error instanceof Error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        errorMessage = "Template document not found at 'public/templates/journal_template.docx'. Please ensure the file exists.";
      } else {
        errorMessage = `Error: ${error.message}. Please check the server logs for more details.`;
      }
    }
    return {
      error: errorMessage,
    };
  }
}
