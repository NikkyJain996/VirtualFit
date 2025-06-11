// src/App.js
import React, { useState, Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { TextureLoader, Color } from 'three';

function Avatar({ url, scale, skinColor }) {
  const gltf = useGLTF(url);

  gltf.scene.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.color = new Color(skinColor);
    }
  });

  return <primitive object={gltf.scene} scale={scale} />;
}

function ClothingPlane({ imageUrl }) {
  const texture = useLoader(TextureLoader, imageUrl);

  return (
    <mesh position={[1.5, 0.5, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  );
}

export default function App() {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(1);
  const [width, setWidth] = useState(1);
  const [skinColor, setSkinColor] = useState('#ffffff');
  const [fileData, setFileData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const modelURL = gender === 'male' ? '/models/male.glb' : '/models/female.glb';

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');

      const result = await res.json();
      const dataUrl = `data:${result.contentType};base64,${result.data}`;
      setFileData(dataUrl);
    } catch (err) {
      setError('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Virtual Try-On</h2>

      <div style={{ marginBottom: 20 }}>
        <label>
          Gender:
          <select value={gender} onChange={e => setGender(e.target.value)} style={{ marginLeft: 10 }}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <br /><br />

        <label>
          Height Scale:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.01"
            value={height}
            onChange={e => setHeight(parseFloat(e.target.value))}
            style={{ marginLeft: 10 }}
          />
          {height}
        </label>

        <br /><br />

        <label>
          Width Scale:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.01"
            value={width}
            onChange={e => setWidth(parseFloat(e.target.value))}
            style={{ marginLeft: 10 }}
          />
          {width}
        </label>

        <br /><br />

        <label>
          Skin Tone:
          <input
            type="color"
            value={skinColor}
            onChange={e => setSkinColor(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </label>

        <br /><br />

        <label>
          Upload Clothing Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ marginLeft: 10 }}
          />
        </label>

        {uploading && <p>Uploading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div style={{ height: '500px', border: '1px solid #ccc' }}>
        <Canvas camera={{ position: [0, 1.5, 3] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            <Avatar
              url={modelURL}
              scale={[width, height, width]}
              skinColor={skinColor}
            />
            {fileData && <ClothingPlane imageUrl={fileData} />}
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
