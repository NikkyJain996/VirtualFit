// src/App.js
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, useTexture } from '@react-three/drei';
import { Color } from 'three';

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
  const texture = useTexture(imageUrl);
  return (
    <mesh position={[1.5, 0.5, 0]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  );
}

export default function App() {
  const [gender, setGender] = useState('male');
  const [dimensions, setDimensions] = useState({ height: 1, width: 1 });
  const [skinColor, setSkinColor] = useState('#ffffff');
  const [imageDataUrl, setImageDataUrl] = useState(null);

  const modelURL =
    gender === 'male'
      ? 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb'
      : 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/BrainStem/glTF-Binary/BrainStem.glb';

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Virtual Try-On</h2>
      <div style={{ marginBottom: 20 }}>
        <label>
          Gender:
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
        <br />
        <label>
          Height Scale: {dimensions.height.toFixed(2)}
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.01"
            value={dimensions.height}
            onChange={(e) =>
              setDimensions((d) => ({ ...d, height: parseFloat(e.target.value) }))
            }
            style={{ marginLeft: 10 }}
          />
        </label>
        <br />
        <label>
          Width Scale: {dimensions.width.toFixed(2)}
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.01"
            value={dimensions.width}
            onChange={(e) =>
              setDimensions((d) => ({ ...d, width: parseFloat(e.target.value) }))
            }
            style={{ marginLeft: 10 }}
          />
        </label>
        <br />
        <label>
          Skin Tone:
          <input
            type="color"
            value={skinColor}
            onChange={(e) => setSkinColor(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </label>
        <br />
        <label>
          Upload Clothing Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ marginLeft: 10 }}
          />
        </label>
      </div>

      <div style={{ height: '500px', border: '1px solid #ccc' }}>
        <Canvas camera={{ position: [0, 1.5, 3] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            <Avatar
              url={modelURL}
              scale={[dimensions.width, dimensions.height, dimensions.width]}
              skinColor={skinColor}
            />
            {imageDataUrl && <ClothingPlane imageUrl={imageDataUrl} />}
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}
