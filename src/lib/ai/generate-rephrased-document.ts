import { generateText } from '@/lib/ai/gemini';

export type RephrasedContent = {
    topic: string;
    experience: string;
    feelings: string;
    learning: string;
    application: string[];
    conclusion: string;
};

export type RephrasedDocumentInput = {
    documentText: string;
    creativityLevel: number;
    humanize: boolean;
};

export type RephrasedDocumentOutput = {
    rephrasedContent: RephrasedContent;
};

export async function generateRephrasedDocument(
    input: RephrasedDocumentInput
): Promise<RephrasedDocumentOutput> {
    const { documentText, creativityLevel, humanize } = input;

    const prompt = `You are an AI assistant that helps students rephrase their reflective journal entries while maintaining their core ideas and reflections.

${humanize ? 'IMPORTANT: Make the output sound natural and human-written, avoiding overly formal or AI-generated language patterns.' : ''}

Creativity Level: ${creativityLevel}/10 (where 1 is minimal rephrasing and 10 is maximum creative restructuring)

Original Journal Entry:
${documentText}

Please rephrase this journal entry and structure it into the following sections. Return ONLY a valid JSON object with this exact structure:

{
  "topic": "A clear, concise topic/title for the reflection",
  "experience": "A detailed description of what happened or was learned (2-3 paragraphs)",
  "feelings": "Emotional reflections and personal responses to the experience (1-2 paragraphs)",
  "learning": "Key insights and learning outcomes (as bullet points, each starting with an asterisk)",
  "application": ["Practical application 1", "Practical application 2", "Practical application 3"],
  "conclusion": "A thoughtful conclusion summarizing the reflection (1 paragraph)"
}

Guidelines:
- Creativity level ${creativityLevel} means ${creativityLevel < 4 ? 'stay very close to the original wording' : creativityLevel < 7 ? 'moderate rephrasing with some new expressions' : 'significant creative restructuring while preserving meaning'}
- Maintain the core ideas and insights from the original
- Keep the personal voice and perspective of the student
- Use academic but accessible language
- For learning section, format as bullet points starting with asterisks (*)
- Ensure all sections are coherent and well-connected
${humanize ? '- Use natural, conversational academic language that sounds human-written' : ''}

Return ONLY the JSON object, no additional text.`;

    try {
        const response = await generateText(prompt);

        // Clean up the response to extract JSON
        let jsonText = response.trim();

        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
        }

        const rephrasedContent: RephrasedContent = JSON.parse(jsonText);

        // Validate the structure
        if (!rephrasedContent.topic || !rephrasedContent.experience ||
            !rephrasedContent.feelings || !rephrasedContent.learning ||
            !rephrasedContent.application || !rephrasedContent.conclusion) {
            throw new Error('Invalid response structure from AI');
        }

        // Ensure learning is a string (convert array to string if needed)
        if (Array.isArray(rephrasedContent.learning)) {
            rephrasedContent.learning = rephrasedContent.learning
                .map(item => `* ${item}`)
                .join('\n');
        } else if (typeof rephrasedContent.learning !== 'string') {
            rephrasedContent.learning = String(rephrasedContent.learning);
        }

        // Ensure application is an array
        if (typeof rephrasedContent.application === 'string') {
            rephrasedContent.application = [rephrasedContent.application];
        } else if (!Array.isArray(rephrasedContent.application)) {
            rephrasedContent.application = [String(rephrasedContent.application)];
        }

        return { rephrasedContent };
    } catch (error) {
        console.error('Error generating rephrased document:', error);
        throw new Error(`Failed to generate rephrased document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
