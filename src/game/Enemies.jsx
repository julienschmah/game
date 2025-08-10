'use client';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function Enemies() {
  const positions = useMemo(() => ({
    [0]: [4, 1.3, -2],
    [1]: [-5, 1.3, 3],
    [2]: [2, 1.3, 6],
  }), []);
  return (
    <group>
      {Object.values(positions).map((p, i) => <Enemy key={i} position={p} hue={0.02 + i * 0.08} />)}
    </group>
  );
}

function Enemy({ position=[0,1.3,0], hue=0.05 }) {
  const body = useRef();
  const core = useRef();
  const target = new THREE.Vector3(0,0,0);
  const color = new THREE.Color().setHSL(hue, 0.65, 0.55);
  const emissive = color.clone().multiplyScalar(0.8);

  useFrame((state, dt) => {
    const rb = body.current; if (!rb) return;
    const pos = rb.translation();
    const to = new THREE.Vector3(target.x - pos.x, 0, target.z - pos.z);
    const dist = to.length();
    if (dist > 0.6) {
      to.normalize();
      const vel = rb.linvel();
      rb.setLinvel({ x: to.x * 2, y: vel.y, z: to.z * 2 }, true);
    }
    // Idle pulse
    if (core.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.07;
      core.current.scale.set(s, s, s);
    }
  });

  return (
    <RigidBody ref={body} position={position}>
      <group>
        <mesh castShadow>
          <capsuleGeometry args={[0.6, 0.9, 8, 16]} />
          <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
        </mesh>
        <mesh ref={core} position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.4} metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
    </RigidBody>
  );
}
