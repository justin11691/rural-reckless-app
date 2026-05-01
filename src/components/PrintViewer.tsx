import { useEffect, useRef } from 'react';
import { Box, X, Layers, Sliders } from 'lucide-react';
import * as THREE from 'three';
interface SlicerParams {
  infill: number;
  material: string;
  supports: boolean;
  layer_height: number;
}

interface PrintData {
  template_type: 'Utility Bracket' | 'Custom Desk Box' | 'Engraved Plate' | 'URL Asset';
  dimensions: { width: number; height: number; depth: number; thickness: number };
  slicer_params: SlicerParams;
  custom_stl_url?: string;
}

export function PrintViewer({ product, onClose }: { product: any; onClose: () => void }) {
  let printData: PrintData = {
    template_type: 'Utility Bracket',
    dimensions: { width: 60, height: 40, depth: 15, thickness: 5 },
    slicer_params: { infill: 20, material: 'PLA', supports: false, layer_height: 0.2 },
  };

  try {
    if (product.file_url && product.file_url.startsWith('PRINT_JSON:')) {
      printData = JSON.parse(product.file_url.substring(11));
    }
  } catch (e) {
    // defaults fallback
  }

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.innerHTML = '';
    const width = canvasRef.current.clientWidth || 400;
    const height = canvasRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#fafafa');

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(printData.dimensions.width * 1.5, printData.dimensions.height * 1.5, printData.dimensions.depth * 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    // Grid & Lights
    const gridHelper = new THREE.GridHelper(200, 20, '#cbd5e1', '#cbd5e1');
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight('#ffffff', 0.85);
    pointLight.position.set(100, 150, 120);
    scene.add(pointLight);

    let geometry: THREE.BufferGeometry;
    if (printData.template_type === 'Utility Bracket') {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(printData.dimensions.width, 0);
      shape.lineTo(printData.dimensions.width, printData.dimensions.thickness);
      shape.lineTo(printData.dimensions.thickness, printData.dimensions.thickness);
      shape.lineTo(printData.dimensions.thickness, printData.dimensions.height);
      shape.lineTo(0, printData.dimensions.height);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        steps: 1,
        depth: printData.dimensions.depth,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.6,
        bevelThickness: 0.6,
      };

      geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } else if (printData.template_type === 'Custom Desk Box') {
      geometry = new THREE.BoxGeometry(printData.dimensions.width, printData.dimensions.height, printData.dimensions.depth);
    } else {
      geometry = new THREE.CylinderGeometry(printData.dimensions.width / 2, printData.dimensions.width / 2, printData.dimensions.depth, 32);
    }

    const material = new THREE.MeshStandardMaterial({
      color: printData.slicer_params?.material === 'PETG' ? '#0ea5e9' : printData.slicer_params?.material === 'PLA' ? '#16a34a' : '#ea580c',
      roughness: 0.45,
      metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(-printData.dimensions.width / 2, 0, -printData.dimensions.depth / 2);
    scene.add(mesh);

    camera.lookAt(mesh.position);

    let animationId: number;
    function render() {
      mesh.rotation.y += 0.005;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(render);
    }
    render();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, [product]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: '1rem' }} onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label={`View ${product.title}`}>
      <div className="card" style={{ width: '100%', maxWidth: '850px', height: '88vh', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', background: '#fcfcfc', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Box size={24} style={{ color: 'var(--color-pine-primary)' }} aria-hidden />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-pine-dark)', lineHeight: 1.2 }}>{product.title}</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Interactive 3D Preview on Rural &amp; Reckless.</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem' }} aria-label="Close viewer"><X size={24} /></button>
        </div>

        {/* Dynamic 3D Viewer Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
          
          {/* Metadata Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderRight: '1px solid var(--color-border)', paddingRight: '1rem', overflowY: 'auto' }}>
            <div className="card" style={{ padding: '1.1rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem' }}>
                <Layers size={16} /> Optimal Print Parameters
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Material:</span>
                  <strong style={{ color: 'var(--color-pine-dark)' }}>{printData.slicer_params?.material || 'PLA'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Infill:</span>
                  <strong style={{ color: 'var(--color-pine-dark)' }}>{printData.slicer_params?.infill || 15}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Layer Height:</span>
                  <strong style={{ color: 'var(--color-pine-dark)' }}>{printData.slicer_params?.layer_height || 0.2} mm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Supports:</span>
                  <strong style={{ color: 'var(--color-pine-dark)' }}>{printData.slicer_params?.supports ? 'Enabled' : 'Disabled'}</strong>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.1rem', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--color-pine-dark)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem' }}>
                <Sliders size={16} /> Mesh Specifications
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                <p style={{ margin: 0 }}>This is a parametric {printData.template_type} designed directly in the web workbench.</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Width:</span>
                    <strong>{printData.dimensions.width} mm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Height:</span>
                    <strong>{printData.dimensions.height} mm</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Depth:</span>
                    <strong>{printData.dimensions.depth} mm</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* WebGL Render Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
            <div ref={canvasRef} style={{ flex: 1, minHeight: '320px', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              <span>Orbiting WebGL canvas active. Direct interactive spin enabled.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
