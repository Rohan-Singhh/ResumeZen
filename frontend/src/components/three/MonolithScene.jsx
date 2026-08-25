/**
 * MonolithScene — ResumeZen's real-3D identity piece.
 *
 * A single obsidian glass slab ("the monolith"), etched with abstracted
 * resume lines and lit by one warm key and one indigo rim, drifting in a
 * studio void with micro-shard dust. Fully procedural: no GLB, no HDR,
 * no CDN fetches — everything below is generated in code so the scene
 * costs nothing to load beyond the bundle itself.
 *
 * Interaction model: the slab never spins like a toy. It sways slowly
 * (weighty), and tilts toward the pointer with heavy lerping — presence,
 * not gimmick.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Edges } from '@react-three/drei';
import * as THREE from 'three';

const ACCENT = '#7c6cf6';
const VOID = '#08080c';

/** Stop rendering entirely while the tab is hidden. */
function PauseWhenHidden() {
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    const onChange = () => setFrameloop(document.hidden ? 'never' : 'always');
    document.addEventListener('visibilitychange', onChange);
    return () => {
      document.removeEventListener('visibilitychange', onChange);
      setFrameloop('always');
    };
  }, [setFrameloop]);
  return null;
}

/* Abstracted "resume text" etched onto the slab face: five hairline bars,
   left-aligned like a real document, widths tuned to feel typeset. */
const TEXT_LINES = [
  { y: 0.84, w: 0.78 },
  { y: 0.60, w: 1.16 },
  { y: 0.40, w: 0.62 },
  { y: 0.16, w: 1.00 },
  { y: -0.08, w: 0.48 },
];

function Monolith({ compact }) {
  const sway = useRef();

  useFrame((state) => {
    if (!sway.current) return;
    const t = state.clock.elapsedTime;
    const targetY = Math.sin(t * 0.18) * 0.26 + state.pointer.x * 0.24;
    const targetX = Math.sin(t * 0.11) * 0.05 - state.pointer.y * 0.10;
    sway.current.rotation.y = THREE.MathUtils.lerp(sway.current.rotation.y, targetY, 0.045);
    sway.current.rotation.x = THREE.MathUtils.lerp(sway.current.rotation.x, targetX, 0.045);
    sway.current.position.y = Math.sin(t * 0.5) * 0.07;
  });

  return (
    <group
      ref={sway}
      position={compact ? [1.7, 0.05, 0] : [0.55, 0, 0]}
      scale={compact ? 0.66 : 1}
    >
      <group rotation={[0.05, -0.46, 0.02]}>
        {/* Obsidian slab */}
        <RoundedBox args={[1.7, 2.4, 0.14]} radius={0.05} smoothness={4} castShadow={false}>
          <meshPhysicalMaterial
            color="#10101a"
            roughness={0.3}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.28}
            reflectivity={0.55}
          />
          <Edges scale={1.001} threshold={20} color="#33334d" />
        </RoundedBox>

        {/* The live edge — one glowing vertical seam, the scene's signature */}
        <mesh position={[0.865, 0, 0]}>
          <boxGeometry args={[0.018, 2.36, 0.17]} />
          <meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={2.4} toneMapped={false} />
        </mesh>

        {/* Etched resume lines */}
        {TEXT_LINES.map((line, i) => (
          <RoundedBox
            key={i}
            args={[line.w, 0.05, 0.03]}
            radius={0.024}
            smoothness={2}
            position={[-0.85 + line.w / 2 + 0.14, line.y, 0.095]}
          >
            <meshStandardMaterial color="#d9d7cf" roughness={0.55} metalness={0.1} transparent opacity={0.72} />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}

/* Slow-orbiting micro-shards. Individually phased so the field feels
   alive rather than rotating as one rigid body. */
function Dust({ count = 130 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const shards = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        r: THREE.MathUtils.randFloat(2.1, 5.4),
        angle: THREE.MathUtils.randFloat(0, Math.PI * 2),
        y: THREE.MathUtils.randFloat(-1.7, 1.9),
        phase: THREE.MathUtils.randFloat(0, Math.PI * 2),
        speed: THREE.MathUtils.randFloat(0.08, 0.32),
        scale: THREE.MathUtils.randFloat(0.45, 1.5),
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const a = s.angle + t * s.speed * 0.05;
      dummy.position.set(
        Math.cos(a) * s.r,
        s.y + Math.sin(t * 0.3 + s.phase) * 0.12,
        Math.sin(a) * s.r * 0.72 // elliptical orbit keeps dust mostly behind/beside
      );
      dummy.rotation.set(t * s.speed * 1.6 + s.phase, t * s.speed, 0);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <octahedronGeometry args={[0.02, 0]} />
      <meshStandardMaterial
        color="#8f8fa6"
        emissive={ACCENT}
        emissiveIntensity={0.22}
        roughness={0.4}
        metalness={0.6}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  );
}

/* Procedural radial glow pooled under the monolith — the "studio floor"
   light, generated on a canvas so no texture asset ships. */
function FloorGlow({ compact }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(124, 108, 246, 0.50)');
    g.addColorStop(0.4, 'rgba(124, 108, 246, 0.16)');
    g.addColorStop(1, 'rgba(124, 108, 246, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[compact ? 1.7 : 0.55, -1.75, 0]}>
      <planeGeometry args={[7.5, 7.5]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function MonolithScene({ compact = false }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 6.4], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <PauseWhenHidden />
      <fog attach="fog" args={[VOID, 8, 14]} />

      <ambientLight intensity={0.18} />
      {/* Warm key, upper right — product-shoot lighting */}
      <directionalLight position={[4, 5, 4]} intensity={1.5} color="#fffaf2" />
      {/* Indigo rim from behind-left — carves the slab out of the void */}
      <directionalLight position={[-6, 2.5, -4]} intensity={2.6} color={ACCENT} />
      {/* Faint under-fill */}
      <pointLight position={[-1.5, -2.5, 2.5]} intensity={6} distance={9} decay={2} color="#39345e" />

      <Monolith compact={compact} />
      <Dust count={compact ? 90 : 130} />
      <FloorGlow compact={compact} />
    </Canvas>
  );
}
