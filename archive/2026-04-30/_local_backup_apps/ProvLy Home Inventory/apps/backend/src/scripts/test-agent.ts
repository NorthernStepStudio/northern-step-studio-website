
import dotenv from 'dotenv';
import { aiService } from '../services/aiService.js';
import { supabaseAdmin } from '../utils/supabase.js';

import path from 'path';

console.log('DEBUG: CWD is', process.cwd());
const envPath = path.resolve(process.cwd(), '../../.env');
console.log('DEBUG: Loading .env from', envPath);
dotenv.config({ path: envPath });

async function runTest() {
    console.log('🧪 Starting ProvLy AI Agent Test...');

    try {
        // 1. Fetch a real user and home to test with
        const { data: homes, error } = await supabaseAdmin
            .from('homes')
            .select('id, user_id, name')
            .limit(1);

        if (error || !homes || homes.length === 0) {
            console.error('❌ No homes found in DB to test with.');
            process.exit(1);
        }

        const home = homes[0];
        console.log(`🏠 Testing with Home: ${home.name} (${home.id})`);
        console.log(`👤 User ID: ${home.user_id}`);

        // 2. Define Test Prompts
        const tests = [
            {
                name: 'Claim Intent Report',
                prompt: 'My house flooded. I need a claim report for my living room items.'
            }
        ];

        // 3. Run Tests
        for (const test of tests) {
            console.log(`\n\n---------------------------------------------------`);
            console.log(`📋 Test Case: ${test.name}`);
            console.log(`🗣️ Prompt: "${test.prompt}"`);
            console.log(`---------------------------------------------------\n`);

            const response = await aiService.runAgent(
                home.user_id,
                '',
                home.id,
                test.prompt,
                [] // empty history
            );

            console.log(`🤖 Agent Response:\n${response}`);

            // Basic Validation
            if (response.includes('FACT_PACK')) {
                console.warn('⚠️  WARNING: Agent output leaked internal FACT_PACK label.');
            }
            if (response.includes('Calm Summary') && response.includes('Totals') && response.includes('Proof Checklist')) {
                console.log('✅ PASS: Output follows Claims Contract structure.');
            } else {
                console.warn('⚠️  WARNING: Output might be missing required sections.');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        process.exit(0);
    }
}

runTest();
