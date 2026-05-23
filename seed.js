import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const url = 'https://crjfaoxwlmqubmpsyodo.supabase.co';
const key = 'sb_publishable_xmEpKVwFMNn44OVuba7NmQ_QJUpC8xo';
const supabase = createClient(url, key);

const names = [
  { full: 'John Miller', user: 'jmiller', tagline: 'Custom Wood & Metal crafts', city: 'Asheville', state: 'NC' },
  { full: 'Sarah Jenkins', user: 'sjenkins', tagline: 'Organic soaps & candles', city: 'Cullman', state: 'AL' },
  { full: 'Robert Thompson', user: 'rthompson', tagline: 'Grounded woodworking', city: 'Knoxville', state: 'TN' },
  { full: 'Emily Davis', user: 'edavis', tagline: 'Hand-sewn textiles & quilts', city: 'Blue Ridge', state: 'GA' },
  { full: 'Michael Wilson', user: 'mwilson', tagline: 'Local farm produce', city: 'Athens', state: 'GA' },
  { full: 'Amanda Martinez', user: 'amartinez', tagline: 'Handmade pottery', city: 'Boone', state: 'NC' },
  { full: 'David Anderson', user: 'danderson', tagline: 'Handcrafted leather goods', city: 'Abingdon', state: 'VA' },
  { full: 'Jessica Taylor', user: 'jtaylor', tagline: 'Fresh farm baked goods', city: 'Pigeon Forge', state: 'TN' },
  { full: 'James Thomas', user: 'jthomas', tagline: 'Quality tools and media', city: 'Crossville', state: 'TN' },
  { full: 'Ashley Jackson', user: 'ajackson', tagline: 'Fine art prints & paintings', city: 'Helen', state: 'GA' }
];

const items = [
  { title: 'Hand-Carved Cherry Bowl', desc: 'Solid cherry, food safe oil finish.', cat: 'Woodworking', price: '$55.00', type: 'farmers_market' },
  { title: 'Lavender Blossom Soap Set', desc: 'Pack of 3 bars, all natural, cold pressed.', cat: 'Candles & Soaps', price: '$18.00', type: 'farmers_market' },
  { title: 'Rustic Cedar Bench', desc: 'Built for the outdoors, weather sealed.', cat: 'Woodworking', price: '$120.00', type: 'farmers_market' },
  { title: 'Heirloom Patchwork Quilt', desc: 'King size, classic style, cotton fabrics.', cat: 'Textiles & Quilts', price: '$210.00', type: 'farmers_market' },
  { title: 'Local Wildflower Honey 16oz', desc: '100% pure raw local honey.', cat: 'Farm & Garden', price: '$14.00', type: 'farmers_market' },
  { title: 'Stoneware Coffee Mug', desc: 'Microwave and dishwasher safe.', cat: 'Pottery & Ceramics', price: '$22.00', type: 'farmers_market' },
  { title: 'Custom Leather Card Wallet', desc: 'Hand-stitched full grain leather.', cat: 'Leather Goods', price: '$35.00', type: 'farmers_market' },
  { title: 'Homemade Sourdough Loaf', desc: 'Baked fresh daily.', cat: 'Baked Goods', price: '$8.50', type: 'farmers_market' },
  { title: 'Vintage Hand Plane No. 4', desc: 'Fully restored, sharp and ready.', cat: 'Tools', price: '$45.00', type: 'rummage' },
  { title: 'Original Appalachian Print', desc: 'Signed by artist, 8x10 print.', cat: 'Painting & Prints', price: '$28.00', type: 'farmers_market' }
];

async function seed() {
  console.log('Starting seed process...');
  for (let i = 0; i < names.length; i++) {
    const n = names[i];
    const p = items[i];
    const uid = crypto.randomUUID();
    
    // Insert profile
    const { error: pError } = await supabase.from('profiles').insert([{
      id: uid,
      email: `${n.user}@ruralandreckless.com`,
      username: n.user,
      full_name: n.full,
      tagline: n.tagline,
      about_me: `I build and make things locally in ${n.city}, ${n.state}. High quality over flash any day.`,
      location_city: n.city,
      location_state: n.state
    }]);
    
    if (pError) {
      console.error('Profile error:', pError.message);
    } else {
      console.log(`Profile created: ${n.full}`);
      
      // Insert listing
      const { error: lError } = await supabase.from('market_listings').insert([{
        user_id: uid,
        seller_name: n.full,
        title: p.title,
        description: p.desc,
        category: p.cat,
        price_display: p.price,
        listing_type: p.type,
        location_city: n.city,
        location_state: n.state,
        cover_image_url: `https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600`
      }]);
      
      if (lError) {
        console.error('Listing error:', lError.message);
      } else {
        console.log(`Listing created: ${p.title} for ${n.full}`);
      }
    }
  }
}

seed();
