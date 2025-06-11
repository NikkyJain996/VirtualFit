// src/App.js
import React, { useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { TextureLoader, Color } from 'three';

function Avatar({ url, scale, skinColor }) {
  // Load the GLB model (must allow cross-origin loading)
  const gltf = useGLTF(url, true);
  // Apply skin color by traversing meshes
  gltf.scene.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material.color = new Color(skinColor);
    }
  });
  return <primitive object={gltf.scene} scale={scale} />;
}

function ClothingPlane({ imageUrl }) {
  // Load texture from base64 data URL
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

  const maleURL = '/models/male.glb';
  const femaleURL = '/models/female.glb';
  const modelURL = gender === 'male' ? maleURL : femaleURL;

  // Handle file input change and upload
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/.netlify/functions/upload', {
      method: 'POST',
      body: formData
    });
    const result = await res.json();
    // Construct data URL for texture loading
    const dataUrl = `data:${result.contentType};base64,${result.data}`;
    setFileData(dataUrl);
  };

  return (
    <div>
      <div style={{ margin: '10px' }}>
        <label>
          Gender:
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <label>
          Height Scale:
          <input type="range" min="0.5" max="2" step="0.01" value={height}
                 onChange={e => setHeight(e.target.value)} />
        </label>
        <label>
          Width Scale:
          <input type="range" min="0.5" max="2" step="0.01" value={width}
                 onChange={e => setWidth(e.target.value)} />
        </label>
        <label>
          Skin Tone:
          <input type="color" value={skinColor}
                 onChange={e => setSkinColor(e.target.value)} />
        </label>
        <label>
          Upload Clothing:
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
      </div>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Avatar 
          url={modelURL} 
          scale={[width, height, width]} 
          skinColor={skinColor} 
        />
        {fileData && <ClothingPlane imageUrl={fileData} />}
      </Canvas>
    </div>
  );
}
