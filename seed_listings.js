import { createClient } from '@supabase/supabase-js';

const url = 'https://crjfaoxwlmqubmpsyodo.supabase.co';
const key = 'sb_publishable_xmEpKVwFMNn44OVuba7NmQ_QJUpC8xo';
const supabase = createClient(url, key);

const uid = '8e937fc6-c4e1-42d4-ab51-3ed832fad131'; // Existing test user id

const items = [
  { seller_name: 'John Miller', title: 'Hand-Carved Cherry Bowl', desc: 'Solid cherry, food safe oil finish.', cat: 'Woodworking', price: '$55.00', type: 'farmers_market', city: 'Asheville', state: 'NC' },
  { seller_name: 'Sarah Jenkins', title: 'Lavender Blossom Soap Set', desc: 'Pack of 3 bars, all natural, cold pressed.', cat: 'Candles & Soaps', price: '$18.00', type: 'farmers_market', city: 'Cullman', state: 'AL' },
  { seller_name: 'Robert Thompson', title: 'Rustic Cedar Bench', desc: 'Built for the outdoors, weather sealed.', cat: 'Woodworking', price: '$120.00', type: 'farmers_market', city: 'Knoxville', state: 'TN' },
  { seller_name: 'Emily Davis', title: 'Heirloom Patchwork Quilt', desc: 'King size, classic style, cotton fabrics.', cat: 'Textiles & Quilts', price: '$210.00', type: 'farmers_market', city: 'Blue Ridge', state: 'GA' },
  { seller_name: 'Michael Wilson', title: 'Local Wildflower Honey 16oz', desc: '100% pure raw local honey.', cat: 'Farm & Garden', price: '$14.00', type: 'farmers_market', city: 'Athens', state: 'GA' },
  { seller_name: 'Amanda Martinez', title: 'Stoneware Coffee Mug', desc: 'Microwave and dishwasher safe.', cat: 'Pottery & Ceramics', price: '$22.00', type: 'farmers_market', city: 'Boone', state: 'NC' },
  { seller_name: 'David Anderson', title: 'Custom Leather Card Wallet', desc: 'Hand-stitched full grain leather.', cat: 'Leather Goods', price: '$35.00', type: 'farmers_market', city: 'Abingdon', state: 'VA' },
  { seller_name: 'Jessica Taylor', title: 'Homemade Sourdough Loaf', desc: 'Fresh farm baked sourdough loaf.', cat: 'Baked Goods', price: '$8.50', type: 'farmers_market', city: 'Pigeon Forge', state: 'TN' },
  { seller_name: 'James Thomas', title: 'Vintage Hand Plane No. 4', desc: 'Fully restored, sharp and ready.', cat: 'Tools', price: '$45.00', type: 'rummage', city: 'Crossville', state: 'TN' },
  { seller_name: 'Ashley Jackson', title: 'Original Appalachian Painting', desc: 'Beautiful landscape print, 8x10.', cat: 'Painting & Prints', price: '$28.00', type: 'farmers_market', city: 'Helen', state: 'GA' }
];

async function seed() {
  console.log('Starting seed of listings...');
  for (const p of items) {
    const { error: lError } = await supabase.from('market_listings').insert([{
      user_id: uid,
      seller_name: p.seller_name,
      title: p.title,
      description: p.desc,
      category: p.cat,
      price_display: p.price,
      listing_type: p.type,
      location_city: p.city,
      location_state: p.state,
      cover_image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=600'
    }]);
    
    if (lError) {
      console.error('Listing error:', lError.message);
    } else {
      console.log(`Listing created: ${p.title} by ${p.seller_name}`);
    }
  }
}

seed();
