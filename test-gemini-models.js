// Comprehensive Gemini API Model Test
// Tests all available models from Google AI Studio

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDzbNUdm6B5yjsqITAjBhJTMqNiaJeewjA';
const genAI = new GoogleGenerativeAI(apiKey);

console.log('=====================================');
console.log('Gemini API Model Test - All Models');
console.log('=====================================\n');
console.log(`API Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 5)}\n`);

// All models from Google AI Studio
const allModels = {
    'Text Generation Models': [
        'gemini-2.5-pro',
        'gemini-2.0-flash-lite',
        'gemini-2.0-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-3-pro',
        'gemini-2.0-flash-exp',
    ],
    'Multi-modal Models': [
        'gemini-2.5-flash-tts',
    ],
    'Live API Models': [
        'gemini-2.0-flash-live',
        'gemini-2.5-flash-live',
        'gemini-2.5-flash-native-audio-dialog',
    ],
    'Other Models': [
        'gemini-robotics-er-1.5-preview',
        'learnlm-2.0-flash-experimental',
    ],
    'Gemma Models': [
        'gemma-3-27b',
        'gemma-3-12b',
        'gemma-3-4b',
        'gemma-3-2b',
        'gemma-3-1b',
    ],
    'Legacy Models (for reference)': [
        'gemini-1.5-pro',
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-pro',
        'gemini-pro-vision',
    ]
};

async function testModel(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hello in one word');
        const response = await result.response;
        const text = response.text();
        return {
            success: true,
            response: text.trim(),
            model: modelName
        };
    } catch (error) {
        let errorMsg = error.message;
        if (errorMsg.includes('404')) {
            errorMsg = 'Not found';
        } else if (errorMsg.includes('403')) {
            errorMsg = 'Permission denied';
        } else if (errorMsg.includes('400')) {
            errorMsg = 'Bad request';
        } else if (errorMsg.includes('API key')) {
            errorMsg = 'Invalid API key';
        } else if (errorMsg.length > 100) {
            errorMsg = errorMsg.substring(0, 100) + '...';
        }
        return {
            success: false,
            error: errorMsg,
            model: modelName
        };
    }
}

async function testAllModels() {
    console.log('🧪 Testing all models from Google AI Studio...\n');

    const allResults = {};
    let totalTested = 0;
    let totalWorking = 0;

    for (const [category, models] of Object.entries(allModels)) {
        console.log(`\n📁 ${category}`);
        console.log('─'.repeat(60));

        const categoryResults = [];

        for (const modelName of models) {
            process.stdout.write(`Testing ${modelName.padEnd(45)}... `);
            const result = await testModel(modelName);
            totalTested++;

            if (result.success) {
                console.log(`✅ Works! "${result.response}"`);
                totalWorking++;
            } else {
                console.log(`❌ ${result.error}`);
            }

            categoryResults.push(result);

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        allResults[category] = categoryResults;
    }

    return { allResults, totalTested, totalWorking };
}

function analyzeResults(data) {
    const { allResults, totalTested, totalWorking } = data;

    console.log('\n\n=====================================');
    console.log('📊 COMPREHENSIVE RESULTS');
    console.log('=====================================\n');

    console.log(`Total models tested: ${totalTested}`);
    console.log(`✅ Working models: ${totalWorking}`);
    console.log(`❌ Failed models: ${totalTested - totalWorking}\n`);

    if (totalWorking === 0) {
        console.log('❌ NO MODELS WORK WITH THIS API KEY!\n');
        console.log('🔧 Action Required:');
        console.log('1. Get your API key from Google AI Studio');
        console.log('2. Click "Get API key" button (top right)');
        console.log('3. Copy the API key');
        console.log('4. Update GEMINI_API_KEY in .env.local');
        console.log('5. Run this test again\n');
        return null;
    }

    // Collect all working models
    const workingModels = [];
    for (const [category, results] of Object.entries(allResults)) {
        const working = results.filter(r => r.success);
        if (working.length > 0) {
            console.log(`\n✅ ${category}: ${working.length} working`);
            working.forEach(r => {
                console.log(`   • ${r.model}`);
                workingModels.push(r);
            });
        }
    }

    // Recommend best model for text generation
    console.log('\n\n=====================================');
    console.log('🎯 RECOMMENDATION FOR YOUR PROJECT');
    console.log('=====================================\n');

    const preferredOrder = [
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-3-pro',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
    ];

    let recommended = null;
    for (const preferred of preferredOrder) {
        recommended = workingModels.find(r => r.model === preferred);
        if (recommended) break;
    }

    if (!recommended) {
        recommended = workingModels[0];
    }

    console.log(`Best model for journal rephrasing: ${recommended.model}\n`);
    console.log('Why this model?');

    if (recommended.model.includes('2.5-pro')) {
        console.log('- Most capable model available');
        console.log('- Best for complex text generation tasks');
        console.log('- Higher quality outputs');
    } else if (recommended.model.includes('flash')) {
        console.log('- Fast response times');
        console.log('- Good balance of quality and speed');
        console.log('- Cost-effective for production');
    } else if (recommended.model.includes('pro')) {
        console.log('- Stable and reliable');
        console.log('- Good for production use');
    }

    console.log('\n📝 UPDATE YOUR CONFIG:\n');
    console.log('File: src/lib/ai/config.ts\n');
    console.log('export const geminiConfig = {');
    console.log('    apiKey: process.env.GEMINI_API_KEY || \'\',');
    console.log(`    model: '${recommended.model}',`);
    console.log('};\n');

    return recommended.model;
}

async function main() {
    try {
        const results = await testAllModels();
        const recommendedModel = analyzeResults(results);

        console.log('\n=====================================');
        console.log('✅ TEST COMPLETE!');
        console.log('=====================================\n');

        if (recommendedModel) {
            console.log('Next steps:');
            console.log('1. Update src/lib/ai/config.ts with the recommended model');
            console.log('2. Make sure GEMINI_API_KEY is in .env.local');
            console.log('3. Restart your dev server: npm run dev');
            console.log('4. Test the journal rephrasing feature\n');
        } else {
            console.log('Please get a valid API key from Google AI Studio first!\n');
        }

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
}

main();
