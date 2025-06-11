## 🖼️ Frontend: `src/App.js`
```jsx
import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function App() {
  const [data, setData] = useState({
    gender: 'female', faceShape: 'oval', skinTone: '#f2d7c4',
    hairStyle: 'straight', hairLength: 'medium',
    height: 170, chest: 90, waist: 70, hips: 95
  });
  const [texture, setTexture] = useState(null);

  function AvatarModel({ info, textureMap }) {
    const gltf = useLoader(GLTFLoader, `/models/${info.gender}.glb`);
    const ref = useRef();
    useEffect(() => {
      if (!ref.current) return;
      const scale = info.height / 170;
      ref.current.scale.set(scale, scale, scale);
      if (textureMap) {
        ref.current.traverse(child => {
          if (child.isMesh && child.name === 'ClothingMesh') {
            child.material.map = textureMap;
            child.material.needsUpdate = true;
          }
        });
      }
    }, [info, textureMap]);
    return <primitive ref={ref} object={gltf.scene} />;
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData(); form.append('item', file);
    const res = await fetch('/.netlify/functions/upload', { method: 'POST', body: form });
    const { url } = await res.json();
    setTexture(new THREE.TextureLoader().load(url));
  }

  function handleChange(evt) {
    const { name, value } = evt.target;
    setData(d => ({ ...d, [name]: value }));
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-5xl text-center mb-6">VirtualFit</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <form className="bg-white p-6 rounded shadow space-y-4">
          {/* Inputs for gender, measurements, face shape, skin tone, hair */}
          {/* ... same as above, using handleChange ... */}
          <div>
            <label className="block font-medium">Upload Item</label>
            <input type="file" accept="image/*" onChange={handleUpload} />
          </div>
        </form>
        <div className="bg-white p-6 rounded shadow">
          <Canvas camera={{ position: [0, 1.5, 3] }} style={{ height: 500 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5,5,5]} intensity={1} />
            <Suspense fallback={null}>
              <AvatarModel info={data} textureMap={texture} />
            </Suspense>
            <OrbitControls enablePan={false} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
```
