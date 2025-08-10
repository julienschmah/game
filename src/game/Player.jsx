'use client';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

export function Player() {
  const body = useRef();
  const sword = useRef();
  const trail = useRef();
  const { camera } = useThree();
  const [onGround, setOnGround] = useState(false);
  const speed = 6.5;
  const jump = 5.8;
  const attackCooldown = useRef(0);
  const tmpV = new THREE.Vector3();

  useFrame((state, dt) => {
    attackCooldown.current = Math.max(0, attackCooldown.current - dt);
    if (!body.current) return;
    const rb = body.current;
    const input = getWASD();

    // Direction from camera
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0), forward).negate();

    // Move vector
    const mx = (input.x || 0);
    const mz = (input.y || 0);
    tmpV.set(0,0,0).addScaledVector(forward, mz).addScaledVector(right, mx);
    if (tmpV.lengthSq() > 0) tmpV.normalize();
    const vel = rb.linvel();
    rb.setLinvel({ x: tmpV.x * speed, y: vel.y, z: tmpV.z * speed }, true);

    // Face movement
    if (tmpV.lengthSq() > 0.0001) {
      const rot = Math.atan2(tmpV.x, tmpV.z);
      body.current.userData.yaw = THREE.MathUtils.lerp(body.current.userData.yaw || 0, rot, 0.2);
    }

    // Jump
    if (input.space && onGround) {
      rb.setLinvel({ x: vel.x, y: jump, z: vel.z }, true);
      setOnGround(false);
    }

    // Attack swing
    attackCooldown.current = Math.max(0, (attackCooldown.current || 0) - dt);
    if (input.mouse && attackCooldown.current === 0) {
      attackCooldown.current = 0.6;
      sword.current.userData.t = 0;
    }
    if (sword.current) {
      const t = Math.min(1, (sword.current.userData.t ?? 1) + dt * 2.8);
      sword.current.userData.t = t;
      const a = Math.sin(t * Math.PI);
      sword.current.rotation.set(-0.15 + a * 0.3, 0.2, -0.6 + a * 1.4);
      if (trail.current) trail.current.material.opacity = (t < 0.5 ? 1 - t * 2 : Math.max(0, 1 - (t - 0.5) * 2));
    }

    // Bobbing
    if (body.current.__group) {
      const g = body.current.__group;
      g.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 6) * 0.02;
      g.rotation.y = body.current.userData.yaw || 0;
    }

    // Camera follow
    const pos = rb.translation();
    camera.position.lerp(new THREE.Vector3(pos.x - 6, pos.y + 4, pos.z + 6), 0.1);
    camera.lookAt(pos.x, pos.y + 1, pos.z);
  });

  return (
    <RigidBody ref={body} canSleep={false} colliders={false}
      onCollisionEnter={(e) => { if (Math.abs(e.manifold.normal.y) > 0.5) setOnGround(true); }}>
      <CapsuleCollider args={[0.9, 0.6]} position={[0, 1.3, 0]} />
      <group ref={(g)=> (body.current && (body.current.__group = g))} position={[0, 1.3, 0]}>
        {/* Body */}
        <mesh castShadow>
          <capsuleGeometry args={[0.6, 0.9, 8, 16]} />
          <meshStandardMaterial color="#a7b1bd" metalness={0.2} roughness={0.6} />
        </mesh>
        {/* Head */}
        <mesh castShadow position={[0, 0.9, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color="#cfd6dd" metalness={0.1} roughness={0.5} />
        </mesh>
        {/* Visor neon */}
        <mesh position={[0, 0.9, 0.3]}>
          <boxGeometry args={[0.4, 0.12, 0.02]} />
          <meshStandardMaterial color="#7aa2f7" emissive="#2b5fd9" emissiveIntensity={1.4} metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Sword */}
        <group ref={sword} position={[0.55, 0.5, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.3, 0.1, 0.22]} />
            <meshStandardMaterial color="#7aa2f7" emissive="#2b5fd9" emissiveIntensity={1.0} metalness={0.7} roughness={0.25} />
          </mesh>
          {/* Trail */}
          <mesh ref={trail} position={[0.4, 0, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.25]} />
            <meshBasicMaterial color="#7aa2f7" transparent opacity={0.0} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  );
}

function getWASD() {
  return {
    x: (key('KeyD') || key('ArrowRight') ? 1 : 0) + (key('KeyA') || key('ArrowLeft') ? -1 : 0),
    y: (key('KeyW') || key('ArrowUp') ? 1 : 0) + (key('KeyS') || key('ArrowDown') ? -1 : 0),
    space: key('Space'),
    mouse: mouseDown()
  };
}

const down = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => down.add(e.code));
  window.addEventListener('keyup', (e) => down.delete(e.code));
  window.addEventListener('blur', () => down.clear());
}
function key(code) { return down.has(code); }

let mdown = false;
if (typeof window !== 'undefined') {
  window.addEventListener('mousedown', () => mdown = true);
  window.addEventListener('mouseup', () => mdown = false);
}
function mouseDown() { return mdown; }
