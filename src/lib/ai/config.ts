export const geminiConfig = {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-2.5-pro',
};

if (!geminiConfig.apiKey && typeof window === 'undefined') {
    console.warn('GEMINI_API_KEY is not set in environment variables');
}
