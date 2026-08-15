"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const EducationObjectMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0x00d4aa),
    uGlowColor: new THREE.Color(0x00ffcc),
  },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uGlowColor;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      float fresnel = 1.0 - dot(normalize(vWorldPosition), normalize(vNormal));
      fresnel = pow(fresnel, 2.0);

      float pulse = sin(uTime * 2.0 + length(vWorldPosition) * 5.0) * 0.5 + 0.5;

      vec3 color = mix(uColor, uGlowColor, pulse * 0.5);
      color += uGlowColor * fresnel * 0.5;

      float alpha = 0.7 + fresnel * 0.3;

      gl_FragColor = vec4(color, alpha);
    }
  `
);

interface EducationObject {
  type: 'building' | 'cap' | 'book' | 'globe' | 'diploma' | 'medal';
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: number;
  delay: number;
}

const objectGeometries: Record<string, () => THREE.BufferGeometry> = {
  building: () => new THREE.BoxGeometry(1, 1.5, 1),
  cap: () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.5, 0);
    shape.quadraticCurveTo(0.7, 0, 0.7, 0.3);
    shape.lineTo(0.7, 0.6);
    shape.quadraticCurveTo(0.7, 0.9, 0.4, 0.9);
    shape.lineTo(0, 0.9);
    shape.quadraticCurveTo(-0.3, 0.9, -0.3, 0.6);
    shape.lineTo(-0.3, 0.3);
    shape.quadraticCurveTo(-0.3, 0, -0.1, 0);
    shape.lineTo(0, 0);
    const geometry = new THREE.LatheGeometry(shape.getPoints(16), 16);
    geometry.scale(0.8, 0.6, 0.8);
    return geometry;
  },
  book: () => {
    const geometry = new THREE.BoxGeometry(1, 0.15, 1.3);
    return geometry;
  },
  globe: () => new THREE.SphereGeometry(0.5, 16, 16),
  diploma: () => new THREE.BoxGeometry(1.3, 0.05, 1),
  medal: () => new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
};

function FloatingObject({
  type,
  position,
  rotation,
  scale,
  color,
  delay,
}: EducationObject) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const initialPosition = useRef(position.clone());
  const initialRotation = useRef(rotation.clone());

  const material = useMemo(() => {
    return new EducationObjectMaterial({
      uTime: 0,
      uColor: new THREE.Color(color),
      uGlowColor: new THREE.Color(0x00ffcc),
      transparent: true,
      depthWrite: false,
    });
  }, [color]);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  useFrame((state) => {
    timeRef.current = state.clock.getElapsedTime();

    if (ref.current) {
      const t = timeRef.current + delay;

      // Floating motion
      ref.current.position.x = initialPosition.current.x + Math.sin(t * 0.5) * 0.3;
      ref.current.position.y = initialPosition.current.y + Math.cos(t * 0.7) * 0.4;
      ref.current.position.z = initialPosition.current.z + Math.sin(t * 0.3) * 0.3;

      // Rotation
      ref.current.rotation.x = initialRotation.current.x + t * 0.1;
      ref.current.rotation.y = initialRotation.current.y + t * 0.15;
      ref.current.rotation.z = initialRotation.current.z + t * 0.05;

      // Subtle scale pulse
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      ref.current.scale.setScalar(scale * pulse);

      // Update shader material uniforms
      if (material.uniforms) {
        material.uniforms.uTime.value = timeRef.current;
      }
    }
  });

  const Geometry = objectGeometries[type] || objectGeometries.building;
  const geometry = Geometry();

  return (
    <mesh ref={ref} position={position.toArray()} rotation={rotation.toArray()} scale={scale}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function EducationObjects({
  count = 15,
  radius = 5,
  globeRadius = 2.5,
  className,
}: {
  count?: number;
  radius?: number;
  globeRadius?: number;
  className?: string;
}) {
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  }, []);

  const objects = useMemo(() => {
    const types: EducationObject['type'][] = ['building', 'cap', 'book', 'globe', 'diploma', 'medal'];
    const colors = [0x00d4aa, 0x6366f1, 0x00ffcc, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x10b981, 0x06b6d4];

    return Array.from({ length: isMobile ? Math.min(count, 8) : count }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = globeRadius + radius * (0.3 + Math.random() * 0.7);

      return {
        type,
        position: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta) * 0.5,
          r * Math.cos(phi)
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.3 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * Math.PI * 2,
      };
    });
  }, [count, radius, globeRadius, isMobile]);

  return (
    <div className={className} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, globeRadius + radius + 2], fov: 45 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true, alpha: true }}
        shadows={false}
      >
        <color attach="background" args={[0x0a0a0f]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} color={0x00ffcc} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color={0x6366f1} />

        {objects.map((obj, i) => (
          <FloatingObject key={i} {...obj} />
        ))}
      </Canvas>
    </div>
  );
}

interface EducationObjectsCanvasProps {
  className?: string;
  count?: number;
  radius?: number;
  globeRadius?: number;
}

export function EducationObjectsCanvas({ className, count = 15, radius = 5, globeRadius = 2.5 }: EducationObjectsCanvasProps) {
  return (
    <EducationObjects className={className} count={count} radius={radius} globeRadius={globeRadius} />
  );
}

// Individual 3D objects for use in other sections
export function Building3D({ className, size = 60 }: { className?: string; size?: number }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 30 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[0x0a0a0f]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 2]} intensity={1} color={0x00ffcc} />
        <BuildingObject size={size / 50} />
      </Canvas>
    </div>
  );
}

function BuildingObject({ size = 1.2 }: { size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.position.y = Math.sin(timeRef.current) * 0.05;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[size * 0.6, size, size * 0.6]} />
      <meshPhysicalMaterial
        color={0x001a1f}
        metalness={0.3}
        roughness={0.4}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export function Cap3D({ className, size = 60 }: { className?: string; size?: number }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0.5, 3], fov: 30 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[0x0a0a0f]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 2]} intensity={1} color={0x00ffcc} />
        <CapObject size={size / 50} />
      </Canvas>
    </div>
  );
}

function CapObject({ size = 1.2 }: { size: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      ref.current.position.y = Math.sin(timeRef.current * 1.5) * 0.08;
    }
  });

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(size * 0.5, 0);
  shape.quadraticCurveTo(size * 0.7, 0, size * 0.7, size * 0.3);
  shape.lineTo(size * 0.7, size * 0.6);
  shape.quadraticCurveTo(size * 0.7, size * 0.9, size * 0.4, size * 0.9);
  shape.lineTo(0, size * 0.9);
  shape.quadraticCurveTo(-size * 0.3, size * 0.9, -size * 0.3, size * 0.6);
  shape.lineTo(-size * 0.3, size * 0.3);
  shape.quadraticCurveTo(-size * 0.3, 0, -size * 0.1, 0);
  shape.lineTo(0, 0);

  const geometry = new THREE.LatheGeometry(shape.getPoints(16), 16);
  geometry.scale(size, size * 0.6, size);
  geometry.center();

  return (
    <mesh ref={ref}>
      <primitive object={geometry} attach="geometry" />
      <meshPhysicalMaterial
        color={0x001a1f}
        metalness={0.2}
        roughness={0.5}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export function Book3D({ className, size = 60 }: { className?: string; size?: number }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 30 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[0x0a0a0f]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 4, 2]} intensity={1} color={0x00ffcc} />
        <BookObject size={size / 50} />
      </Canvas>
    </div>
  );
}

function BookObject({ size = 1.2 }: { size: number }) {
  const ref = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state) => {
    timeRef.current = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = Math.sin(timeRef.current) * 0.3;
      ref.current.rotation.x = Math.cos(timeRef.current * 0.7) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      {/* Book cover */}
      <mesh position={[0, size * 0.08, 0]}>
        <boxGeometry args={[size, size * 0.15, size * 1.3]} />
        <meshPhysicalMaterial
          color={0x0a0a0f}
          metalness={0.1}
          roughness={0.6}
          clearcoat={0.3}
        />
      </mesh>
      {/* Pages */}
      <mesh position={[0, -size * 0.08, 0]}>
        <boxGeometry args={[size * 0.95, size * 0.1, size * 1.25]} />
        <meshPhysicalMaterial
          color={0xf8fafc}
          metalness={0}
          roughness={0.9}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Spine */}
      <mesh position={[-size * 0.5, 0, 0]}>
        <boxGeometry args={[size * 0.05, size * 0.25, size * 1.3]} />
        <meshPhysicalMaterial
          color={0x00d4aa}
          metalness={0.5}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
}