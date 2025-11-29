// Test script to verify Gemini API key with gemini-pro model
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDzbNUdm6B5yjsqITAjBhJTMqNiaJeewjA';
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
    try {
        console.log('Testing Gemini API key with gemini-pro model...');
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        const text = response.text();
        console.log('✅ API key is valid!');
        console.log('Response:', text);
    } catch (error) {
        console.error('❌ API key test failed:', error.message);
    }
}

testGemini();
