import { useState } from 'react';
import { supabase } from '../lib/supabase';
import seedData from '../seedDataFull.json';

const JUSTIN_ID = 'fb46aa3f-66d8-4ec9-8a5a-2d46898fd303';
const GROUPS = {
    RECIPES: 'f3000000-0000-0000-0000-000000000003',
    THREE_D: 'f2000000-0000-0000-0000-000000000002',
    PATTERNS: 'f4000000-0000-0000-0000-000000000004',
    PREPPER: 'f6000000-0000-0000-0000-000000000006'
};

export function SeedManager() {
    const [status, setStatus] = useState<string>('Ready to seed.');
    const [loading, setLoading] = useState(false);

    const runSeed = async () => {
        setLoading(true);
        setStatus('Starting seeding process...');

        try {
            // 1. Create Prepper Group
            setStatus('Checking/Creating Prepper Group...');
            await supabase.from('communities').upsert({
                id: GROUPS.PREPPER,
                name: 'Prepper & Survival Knowledge',
                description: 'Emergency preparedness, water purification, and medicinal plant knowledge.',
                category: 'Education',
                is_public: true,
                owner_id: JUSTIN_ID
            });

            // 2. Insert Recipes
            setStatus(`Inserting ${seedData.recipes.length} Recipes...`);
            const recipePosts = seedData.recipes.map((r: any) => ({
                user_id: JUSTIN_ID,
                group_id: GROUPS.RECIPES,
                content: `[#Recipe] ${r.title}: ${r.content}`
            }));
            await supabase.from('posts').insert(recipePosts);

            // 3. Insert Patterns
            setStatus(`Inserting ${seedData.patterns.length} Patterns...`);
            const patternItems = seedData.patterns.map((p: any) => ({
                seller_id: JUSTIN_ID,
                category: p.type === 'knitting' ? 'Knitting Patterns' : 'Sewing Patterns',
                title: p.title,
                description: p.summary,
                price_display: 'Free',
                payment_url: p.url,
                file_url: p.url
            }));
            await supabase.from('digital_products').insert(patternItems);

            // 4. Insert 3D Prints
            setStatus(`Inserting ${seedData.three_d_files.length} 3D Prints...`);
            const threeDItems = seedData.three_d_files.map((f: any) => ({
                seller_id: JUSTIN_ID,
                category: '3D Prints',
                title: f.title,
                description: f.summary,
                price_display: 'Free',
                payment_url: f.url,
                file_url: f.url
            }));
            await supabase.from('digital_products').insert(threeDItems);

            // 5. Insert Prepper Tips
            setStatus(`Inserting ${seedData.prepper_tips.length} Prepper Tips...`);
            const prepperPosts = seedData.prepper_tips.map((t: any) => ({
                user_id: JUSTIN_ID,
                group_id: GROUPS.PREPPER,
                content: `[#Survival] ${t.title}: ${t.content}`
            }));
            await supabase.from('posts').insert(prepperPosts);

            setStatus('Seeding Complete! All content is now live.');
        } catch (e: any) {
            setStatus('Error: ' + e.message);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card" style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto' }}>
            <h2 style={{ color: 'var(--color-pine-dark)' }}>Platform Content Seeder</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
                This tool will populate the Rural & Reckless marketplace with {seedData.recipes.length} recipes, {seedData.patterns.length} patterns, {seedData.three_d_files.length} 3D files, and survival knowledge.
            </p>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-bg-base)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <strong>Status:</strong> {status}
            </div>
            <button 
                onClick={runSeed} 
                disabled={loading}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {loading ? 'Seeding Content...' : 'Start Seeding Now'}
            </button>
        </div>
    );
}
