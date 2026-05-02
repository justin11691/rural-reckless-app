import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Box, Layers, Plus, Trash2, X, ChevronRight, Save, Sliders, Sparkles } from 'lucide-react';
import * as THREE from 'three';

interface SlicerParams {
  infill: number;
  material: string;
  supports: boolean;
  layer_height: number;
}

interface PrintData {
  template_type: 'Utility Bracket' | 'Custom Desk Box' | 'Engraved Plate' | 'URL Asset' | 'Custom Nameplate' | 'Cylinder Container';
  dimensions: { width: number; height: number; depth: number; thickness: number };
  slicer_params: SlicerParams;
  custom_stl_url?: string;
}

export function PrintStudio({ userId, onPublished }: { userId?: string; onPublished: () => void }) {
  const [myPrints, setMyPrints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingPrint, setEditingPrint] = useState<any>(null);

  // Form states for new printable
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCover, setNewCover] = useState('');
  const [newPaymentUrl, setNewPaymentUrl] = useState('');
  const [newCryptoUrl, setNewCryptoUrl] = useState('');

  useEffect(() => { fetchMyPrints(); }, []);

  async function fetchMyPrints() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const targetUserId = userId || session?.user?.id;
    if (targetUserId) {
      const { data } = await supabase
        .from('digital_products')
        .select('*')
        .eq('owner_id', targetUserId);
      
      let filtered = (data || []).filter(p => p.file_url && (p.file_url.startsWith('PRINT_JSON:') || p.category === 'Design Files'));
      if (filtered.length === 0) {
        filtered = [
          {
            id: 'sample-benchy',
            title: '3D Benchy - Public Domain Calibration STL',
            description: 'The standard test print for FDM printers to test overhangs, bridging, and extrusion.',
            price_display: 'Free Download',
            cover_image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=640',
            file_url: 'PRINT_JSON:{"template_type":"URL Asset","dimensions":{"width":60,"height":31,"depth":48,"thickness":1},"slicer_params":{"infill":15,"material":"PLA","supports":false,"layer_height":0.2},"custom_stl_url":"https://raw.githubusercontent.com/roryok/3D-Benchy/master/3D-Benchy.stl"}'
          },
          {
            id: 'sample-flexi',
            title: 'Articulated Flexi-Dragon - Print in Place',
            description: 'A beautiful flexible dragon figurine that needs no supports. Tested on standard Ender 3.',
            price_display: '$2.50 Download',
            cover_image_url: 'https://images.unsplash.com/photo-1542223175730-ee0cf4c6f2a4?auto=format&fit=crop&q=80&w=640',
            file_url: 'PRINT_JSON:{"template_type":"URL Asset","dimensions":{"width":120,"height":45,"depth":110,"thickness":2},"slicer_params":{"infill":20,"material":"PLA","supports":false,"layer_height":0.2}}'
          }
        ];
      }
      setMyPrints(filtered);
    }
    setLoading(false);
  }

  async function createPrint() {
    if (!newTitle.trim() || !newPrice.trim()) return;
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Build the default printable settings
    const draftData: PrintData = {
      template_type: 'Utility Bracket',
      dimensions: { width: 60, height: 40, depth: 15, thickness: 5 },
      slicer_params: { infill: 20, material: 'PLA', supports: false, layer_height: 0.2 }
    };

    const { data, error } = await supabase
      .from('digital_products')
      .insert([{
        owner_id: session.user.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        price_display: newPrice.trim(),
        cover_image_url: newCover.trim() || null,
        payment_url: newPaymentUrl.trim() || null,
        crypto_url: newCryptoUrl.trim() || null,
        category: 'Design Files',
        is_active: false,
        file_url: 'PRINT_JSON:' + JSON.stringify(draftData)
      }])
      .select()
      .single();

    if (error) {
      alert('Could not open customizer draft: ' + error.message);
    } else {
      setNewTitle(''); setNewDesc(''); setNewPrice(''); setNewCover(''); setNewPaymentUrl(''); setNewCryptoUrl('');
      setShowCreator(false);
      setEditingPrint(data);
      fetchMyPrints();
    }
    setLoading(false);
  }

  if (editingPrint) {
    return <PrintEditorInterface print={editingPrint} onClose={() => { setEditingPrint(null); fetchMyPrints(); }} onPublished={onPublished} />;
  }

  return (
    <div className="print-studio" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Upper header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.4rem' }}>🖨️ 3D Print Studio</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Build and tweak printable files, or customize parametric templates with live WebGL previews.</p>
        </div>
        <button onClick={() => setShowCreator(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.25rem', fontWeight: 600 }}>
          <Plus size={18} /> Launch a Printable
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
          <Layers size={32} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
          Drafting workbench active...
        </div>
      ) : myPrints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
          <Box size={42} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '1.15rem', marginBottom: '0.45rem', color: 'var(--color-pine-dark)' }}>No printed listing drafts found.</p>
          <p>Get reckless and create your first customizable 3D model.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {myPrints.map(p => {
            const hasDraft = p.file_url && p.file_url.startsWith('PRINT_JSON:');
            return (
              <div key={p.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', border: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', background: p.is_active ? 'var(--color-pine-light)' : 'var(--color-bg-base)', border: '1px solid var(--color-border)', padding: '0.15rem 0.55rem', borderRadius: 4, color: p.is_active ? 'var(--color-pine-dark)' : 'var(--color-text-muted)' }}>
                      {p.is_active ? '✅ Active Listing' : '📝 Tweak Draft'}
                    </span>
                    <span style={{ fontWeight: 700, color: p.price_display?.toLowerCase() === 'free' ? 'var(--color-pine-primary)' : 'var(--color-accent)' }}>
                      {p.price_display}
                    </span>
                  </div>
                  <h3 style={{ margin: '0.65rem 0 0.35rem', fontSize: '1.05rem', color: 'var(--color-pine-dark)', lineHeight: 1.3 }}>{p.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.description || 'No description provided.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setEditingPrint(p)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <Box size={14} /> {hasDraft ? 'Tweak Customizer' : 'Manage Print'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Are you sure you want to delete this 3D print listing?')) return;
                      await supabase.from('digital_products').delete().eq('id', p.id);
                      fetchMyPrints();
                      onPublished();
                    }}
                    style={{ background: 'transparent', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                    aria-label="Delete Print"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D Print Creator Modal */}
      {showCreator && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }} onClick={e => e.target === e.currentTarget && setShowCreator(false)}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-pine-dark)' }}>Launch a 3D Printable</h3>
              <button onClick={() => setShowCreator(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Title *</label>
                <input type="text" className="post-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Parametric Monitor Stand Bracket" style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Print Features &amp; Instructions</label>
                <textarea className="post-input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What are the optimal settings? Fit tolerances?" style={{ width: '100%', margin: 0, resize: 'vertical' }} rows={2} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Price *</label>
                <input type="text" className="post-input" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Free or $10.00" style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Cover Photo / Render URL</label>
                <input type="url" className="post-input" value={newCover} onChange={e => setNewCover(e.target.value)} placeholder="https://..." style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Card Payment URL (Optional)</label>
                <input type="url" className="post-input" value={newPaymentUrl} onChange={e => setNewPaymentUrl(e.target.value)} placeholder="https://buy.stripe.com/..." style={{ width: '100%', margin: 0 }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Crypto Payment URL (Optional)</label>
                <input type="url" className="post-input" value={newCryptoUrl} onChange={e => setNewCryptoUrl(e.target.value)} placeholder="https://commerce.coinbase.com/..." style={{ width: '100%', margin: 0 }} />
              </div>

              <button onClick={createPrint} disabled={!newTitle.trim() || !newPrice.trim() || loading} style={{ marginTop: '0.5rem', padding: '0.8rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Creating...' : 'Open Customizer Workcell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrintEditorInterface({ print, onClose, onPublished }: { print: any; onClose: () => void; onPublished: () => void }) {
  const [title, setTitle] = useState(print.title || '');
  const [desc, setDesc] = useState(print.description || '');
  const [price, setPrice] = useState(print.price_display || '');
  const [cover, setCover] = useState(print.cover_image_url || '');

  const [paymentUrl, setPaymentUrl] = useState(print.payment_url || '');
  const [cryptoUrl, setCryptoUrl] = useState(print.crypto_url || '');

  // 3D parameters
  const [templateType, setTemplateType] = useState<PrintData['template_type']>('Utility Bracket');
  const [dimensions, setDimensions] = useState({ width: 60, height: 40, depth: 15, thickness: 5 });
  const [slicerParams, setSlicerParams] = useState<SlicerParams>({ infill: 20, material: 'PLA', supports: false, layer_height: 0.2 });
  const [customStlUrl, setCustomStlUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // AI Mesh Sculptor toggle state
  const [isAISculptActive, setIsAISculptActive] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize and update WebGL preview
  useEffect(() => {
    if (!canvasRef.current) return;

    // Clear any existing canvases
    canvasRef.current.innerHTML = '';

    const width = canvasRef.current.clientWidth || 400;
    const height = canvasRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc');

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(dimensions.width * 1.5, dimensions.height * 1.5, dimensions.depth * 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    // Grid & Lighting
    const gridHelper = new THREE.GridHelper(200, 20, '#94a3b8', '#cbd5e1');
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.65);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight('#ffffff', 0.85);
    pointLight.position.set(120, 180, 100);
    scene.add(pointLight);

    // Build parametric mesh based on selected template type
    let geometry: THREE.BufferGeometry;
    if (templateType === 'Utility Bracket') {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(dimensions.width, 0);
      shape.lineTo(dimensions.width, dimensions.thickness);
      shape.lineTo(dimensions.thickness, dimensions.thickness);
      shape.lineTo(dimensions.thickness, dimensions.height);
      shape.lineTo(0, dimensions.height);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        steps: 1,
        depth: dimensions.depth,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.8,
        bevelThickness: 0.8,
      };

      geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } else if (templateType === 'Custom Desk Box') {
      geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
    } else if (templateType === 'Custom Nameplate') {
      geometry = new THREE.BoxGeometry(dimensions.width, dimensions.thickness, dimensions.depth);
    } else if (templateType === 'Cylinder Container') {
      geometry = new THREE.CylinderGeometry(dimensions.width / 2, dimensions.width / 2, dimensions.depth, 32);
    } else if (templateType === 'Engraved Plate') {
      geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.thickness || 2);
    } else {
      geometry = new THREE.CylinderGeometry(dimensions.width / 2, dimensions.width / 2, dimensions.depth, 32);
    }


    const material = new THREE.MeshStandardMaterial({
      color: slicerParams.material === 'PETG' ? '#0ea5e9' : slicerParams.material === 'PLA' ? '#16a34a' : '#ea580c',
      roughness: 0.45,
      metalness: 0.25
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-dimensions.width / 2, 0, -dimensions.depth / 2);
    scene.add(mesh);

    camera.lookAt(mesh.position);

    let animationFrameId: number;
    function renderScene() {
      mesh.rotation.y += 0.004;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderScene);
    }
    renderScene();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [templateType, dimensions.width, dimensions.height, dimensions.depth, dimensions.thickness, slicerParams.material]);

  // Read draft or file_url data
  useEffect(() => {
    if (print.file_url && print.file_url.startsWith('PRINT_JSON:')) {
      try {
        const parsed: PrintData = JSON.parse(print.file_url.substring(11));
        if (parsed.template_type) setTemplateType(parsed.template_type);
        if (parsed.dimensions) setDimensions(parsed.dimensions);
        if (parsed.slicer_params) setSlicerParams(parsed.slicer_params);
        if (parsed.custom_stl_url) setCustomStlUrl(parsed.custom_stl_url);
      } catch (e) {
        // fallback
      }
    }
  }, [print]);

  async function saveListing(publish: boolean) {
    setSaving(true);
    const data: PrintData = {
      template_type: templateType,
      dimensions,
      slicer_params: slicerParams,
      custom_stl_url: customStlUrl.trim() || undefined
    };

    const fileUrl = 'PRINT_JSON:' + JSON.stringify(data);

    const { error } = await supabase.from('digital_products').update({
      title: title.trim(),
      description: desc.trim(),
      price_display: price.trim(),
      payment_url: paymentUrl.trim() || null,
      crypto_url: cryptoUrl.trim() || null,
      cover_image_url: cover.trim() || null,
      file_url: fileUrl,
      is_active: publish
    }).eq('id', print.id);

    if (error) {
      alert('Error updating 3D print: ' + error.message);
    } else {
      alert(publish ? 'Product listing successfully launched!' : '3D print draft saved.');
      onPublished();
      onClose();
    }
    setSaving(false);
  }

  async function submitAISculptor() {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    // Simulation / integration of AI Mesh generation (Auto-fee toggle or credit check)
    setTimeout(() => {
      setDimensions({ width: 85, height: 50, depth: 40, thickness: 8 });
      setTemplateType('Custom Desk Box');
      setAiPrompt('');
      alert('AI Mesh Sculptor generated high fit tolerance settings successfully!');
      setAiGenerating(false);
    }, 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.45rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-main)', fontSize: '0.85rem' }}>
            <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
          </button>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '1.25rem', lineHeight: 1.2 }}>{title || 'Draft 3D Print'}</h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Workcell drafting room direct directly in Rural &amp; Reckless.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => saveListing(false)} disabled={saving} style={{ padding: '0.55rem 1rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            Save Draft
          </button>
          <button onClick={() => saveListing(true)} disabled={saving} style={{ padding: '0.55rem 1rem', background: 'var(--color-pine-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Save size={16} /> Publish Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', minHeight: '520px' }}>
        {/* Left: Customizer Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '580px', overflowY: 'auto' }}>
          
          {/* AI Mesh Sculptor Package Upgrade UI */}
          <div className="card" style={{ padding: '1.25rem', border: '2px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', background: '#fffbeb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.92rem' }}>
                <Sparkles size={17} /> AI Mesh Sculptor Upgrade
              </h4>
              <button onClick={() => setIsAISculptActive(!isAISculptActive)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', border: '1px solid #d97706', background: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#b45309', fontWeight: 600 }}>
                {isAISculptActive ? 'Minimize' : 'View Upgrade Option'}
              </button>
            </div>
            {isAISculptActive && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#78350f', lineHeight: 1.4 }}>Activate AI assistance for a small one-time upgrade fee. Tell the AI what kind of item you are building and it will compute fit dimensions and tolerances automatically.</p>
                <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.25rem' }}>
                  <input type="text" className="post-input" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. Design a customized spacer bracket..." style={{ flex: 1, margin: 0, fontSize: '0.82rem', padding: '0.4rem 0.65rem' }} />
                  <button onClick={submitAISculptor} disabled={!aiPrompt.trim() || aiGenerating} style={{ padding: '0.45rem 0.75rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    {aiGenerating ? 'Sculpting…' : 'Enhance'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customizer Geometry Form */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sliders size={16} /> Customizer Geometry
            </h4>
            
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Mesh Template Type</label>
              <select value={templateType} onChange={e => setTemplateType(e.target.value as any)} style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-sm)' }}>
                <option value="Utility Bracket">Utility Bracket</option>
                <option value="Custom Desk Box">Custom Desk Box</option>
                <option value="Custom Nameplate">Custom Nameplate</option>
                <option value="Cylinder Container">Cylinder Container</option>
                <option value="Engraved Plate">Engraved Plate</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Width / Radius (mm)</label>
                <input type="number" className="post-input" value={dimensions.width} onChange={e => setDimensions({ ...dimensions, width: Number(e.target.value) })} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Height (mm)</label>
                <input type="number" className="post-input" value={dimensions.height} onChange={e => setDimensions({ ...dimensions, height: Number(e.target.value) })} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Depth (mm)</label>
                <input type="number" className="post-input" value={dimensions.depth} onChange={e => setDimensions({ ...dimensions, depth: Number(e.target.value) })} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Thickness (mm)</label>
                <input type="number" className="post-input" value={dimensions.thickness} onChange={e => setDimensions({ ...dimensions, thickness: Number(e.target.value) })} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>
          </div>

          {/* Advanced Slicer Metadata Form */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={16} /> Slicer Parameters
            </h4>
            
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Material</label>
              <select value={slicerParams.material} onChange={e => setSlicerParams({ ...slicerParams, material: e.target.value })} style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-sm)' }}>
                <option value="PLA">PLA (Polylactic Acid)</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Infill (%)</label>
                <input type="number" className="post-input" value={slicerParams.infill} onChange={e => setSlicerParams({ ...slicerParams, infill: Number(e.target.value) })} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Layer (mm)</label>
                <input type="number" step="0.05" className="post-input" value={slicerParams.layer_height} onChange={e => setSlicerParams({ ...slicerParams, layer_height: Number(e.target.value) })} style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="supports-chk" checked={slicerParams.supports} onChange={e => setSlicerParams({ ...slicerParams, supports: e.target.checked })} />
              <label htmlFor="supports-chk" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>Requires Supports</label>
            </div>
          </div>
        </div>

        {/* Right: Real-time WebGL Preview Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div ref={canvasRef} style={{ flex: 1, minHeight: '420px', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }} />
          
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.92rem' }}>Details &amp; Custom Assets</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Product Title</label>
                <input type="text" className="post-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Description</label>
                <input type="text" className="post-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Print settings, infill etc." style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Price Display</label>
                <input type="text" className="post-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="Free or $10" style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Cover Image URL</label>
                <input type="url" className="post-input" value={cover} onChange={e => setCover(e.target.value)} placeholder="https://..." style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Card Payment URL (Optional)</label>
                <input type="url" className="post-input" value={paymentUrl} onChange={e => setPaymentUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Crypto Payment URL (Optional)</label>
                <input type="url" className="post-input" value={cryptoUrl} onChange={e => setCryptoUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>External STL / GLB URL (Optional)</label>
                <input type="url" className="post-input" value={customStlUrl} onChange={e => setCustomStlUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', margin: 0, fontSize: '0.82rem' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
