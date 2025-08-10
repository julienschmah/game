'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { OrbitControls, Environment, ContactShadows, Html, MeshReflectorMaterial, Sparkles, Float, Stats } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { EffectComposer, Bloom, SSAO, Vignette, SMAA } from '@react-three/postprocessing';
import { Player } from './Player';
import { Enemies } from './Enemies';

export default function Game({ started, onError }) {
  const [ready, setReady] = useState(false);
  const controlsRef = useRef();

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <Canvas shadows camera={{ position: [0, 2, 6], fov: 60 }} dpr={[1, 2]} className="bg-black">
      <Suspense fallback={<Html center style={{ color: 'white' }}>Carregando assets…</Html>}>
        <color attach="background" args={[0x0b0d13]} />
        <fog attach="fog" args={[0x0b0d13, 12, 80]} />

        {/* Ambiente HDR para luz/reflexo mais realista */}
        <Environment preset="city" background={false} blur={0.25} />

        {/* Luzes */}
        <ambientLight intensity={0.4} />
        <hemisphereLight intensity={0.35} groundColor="#0b0d13" />
        <directionalLight castShadow position={[10, 12, 6]} intensity={1.2}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />

        <Physics gravity={[0, -9.82, 0]}>
          <Ground />
          <SceneProps />
          {started && <Player />}
          {started && <Enemies />}
        </Physics>

        {/* Sombra de contato macia no chão */}
        <ContactShadows opacity={0.4} scale={50} blur={2.4} far={25} resolution={1024} color="#000000" />

        {/* Partículas sutis no ar */}
        <Sparkles count={60} scale={[80, 10, 80]} size={2} speed={0.3} color="#7aa2f7" opacity={0.15} />

        {/* Pós-processamento */}
        <EffectComposer multisampling={0}> {/* SMAA já cuida do AA */}
          <SMAA />
          <SSAO samples={16} radius={0.15} intensity={25} luminanceInfluence={0.6} />
          <Bloom intensity={0.8} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>

        <Stats showPanel={0} className="stats" />
        <OrbitControls ref={controlsRef} enabled={!started} makeDefault />
      </Suspense>
    </Canvas>
  );
}

function Ground() {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[200, 200, 1, 1]} />
        <MeshReflectorMaterial
          color="#0d1117"
          metalness={0.2}
          roughness={0.8}
          blur={[300, 100]}
          mixBlur={1}
          mixStrength={6}
          depthScale={0.2}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.4}
          mirror={0.2}
        />
      </mesh>
    </RigidBody>
  );
}

function SceneProps() {
  const pillars = [
    { pos: [6, 1.1, -4], scale: [0.6, 2.2, 0.6] },
    { pos: [-8, 1.1, 5], scale: [0.4, 1.8, 0.4] },
    { pos: [2, 1.1, 9], scale: [0.5, 2.5, 0.5] },
    { pos: [-4, 1.1, -7], scale: [0.45, 2.0, 0.45] },
  ];
  return (
    <group>
      {pillars.map((p, i) => (
        <Float key={i} speed={1 + i * 0.1} floatIntensity={0.15} rotationIntensity={0.15}>
          <mesh position={p.pos} scale={p.scale} castShadow>
            <boxGeometry args={[1, 2, 1]} />
            <meshStandardMaterial color="#1b2333" emissive="#122244" emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[p.pos[0], p.pos[1] + p.scale[1] + 0.3, p.pos[2]]}>
            <icosahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial color="#7aa2f7" emissive="#2b5fd9" emissiveIntensity={1.6} metalness={0.6} roughness={0.2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
