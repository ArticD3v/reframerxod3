import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig } from './config';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);

/**
 * Get a Gemini model instance
 * @param modelName - Optional model name (defaults to config)
 */
export function getGeminiModel(modelName?: string) {
    return genAI.getGenerativeModel({ model: modelName || geminiConfig.model });
}

/**
 * Generate text using Gemini AI
 * @param prompt - The prompt to send to the model
 * @param modelName - Optional model name
 */
export async function generateText(prompt: string, modelName?: string) {
    const model = getGeminiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

/**
 * Generate text with streaming
 * @param prompt - The prompt to send to the model
 * @param modelName - Optional model name
 */
export async function* generateTextStream(prompt: string, modelName?: string) {
    const model = getGeminiModel(modelName);
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
    }
}

/**
 * Chat with Gemini AI (multi-turn conversation)
 * @param history - Array of previous messages
 * @param message - Current message
 * @param modelName - Optional model name
 */
export async function chat(
    history: Array<{ role: 'user' | 'model'; parts: string }>,
    message: string,
    modelName?: string
) {
    const model = getGeminiModel(modelName);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
}

export { genAI };
